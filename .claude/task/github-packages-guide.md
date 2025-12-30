# Guide de publication sur GitHub Packages

## Vue d'ensemble

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Développeur    │────▶│  GitHub Packages│────▶│  Utilisateur    │
│  npm publish    │     │  @atlashub/...  │     │  npm install    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  API AtlasHub   │
                                                │  /validate-key  │
                                                └─────────────────┘
```

---

## 1. Configuration GitHub Packages

### Créer un Personal Access Token (PAT)

1. Va sur https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Sélectionne les scopes :
   - `write:packages` (publier)
   - `read:packages` (lire)
   - `delete:packages` (optionnel)
4. Copie le token généré

### Configurer npm localement

```bash
# Option 1 : Via .npmrc global (~/.npmrc)
echo "//npm.pkg.github.com/:_authToken=ghp_XXXXXXXXXXXX" >> ~/.npmrc

# Option 2 : Via npm login
npm login --scope=@atlashub --registry=https://npm.pkg.github.com
# Username: ton-username-github
# Password: ton-PAT
# Email: ton-email
```

### Vérifier la configuration

```bash
npm whoami --registry=https://npm.pkg.github.com
# → davidtruninger (ou ton username)
```

---

## 2. Configuration du projet

### .npmrc du projet

```ini
@atlashub:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### package.json

```json
{
  "name": "@atlashub/claude-gitflow",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/atlashub/claude-gitflow.git"
  }
}
```

> **Important** : Le scope `@atlashub` doit correspondre à ton organisation ou username GitHub.

---

## 3. Publication

### Première publication

```bash
# Build le projet
npm run build

# Vérifier ce qui sera publié
npm pack --dry-run

# Publier
npm publish
```

### Mise à jour

```bash
# Bump version
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0
npm version major  # 1.1.0 → 2.0.0

# Publier
npm publish
```

### Publication via GitHub Actions (CI/CD)

Crée `.github/workflows/publish.yml` :

```yaml
name: Publish to GitHub Packages

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@atlashub'
          
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 4. Installation côté utilisateur

### Prérequis utilisateur

L'utilisateur doit :

1. **Avoir un compte GitHub**
2. **Créer un PAT** avec scope `read:packages`
3. **Configurer npm** :

```bash
# Configurer l'accès
npm config set @atlashub:registry https://npm.pkg.github.com
echo "//npm.pkg.github.com/:_authToken=ghp_XXXXXXXXXXXX" >> ~/.npmrc
```

### Installation

```bash
# Installation globale
npm install -g @atlashub/claude-gitflow

# Activer la licence
claude-gitflow activate CGFW-XXXX-XXXX-XXXX

# Installer dans un projet
cd mon-projet
claude-gitflow install
```

---

## 5. Système de licence

### Flux complet

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  1. ACHAT                                                        │
│     Utilisateur → atlashub.ch/buy → Stripe → Génération clé     │
│                                                                  │
│  2. ACTIVATION                                                   │
│     claude-gitflow activate CGFW-XXXX-XXXX-XXXX                 │
│     → Validation API AtlasHub                                    │
│     → Stockage local ~/.claude-gitflow-license.json             │
│                                                                  │
│  3. UTILISATION                                                  │
│     claude-gitflow install                                       │
│     → Vérification locale (cache 7 jours)                       │
│     → Si expiré : re-validation online                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### API de validation (côté AtlasHub)

Ajoute ce controller dans ton projet AtlasHub :

```csharp
// Controllers/LicenseApiController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AtlasHub.Controllers;

[ApiController]
[Route("api/licenses")]
public class LicenseApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<LicenseApiController> _logger;

    public LicenseApiController(
        ApplicationDbContext context,
        ILogger<LicenseApiController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("validate")]
    public async Task<IActionResult> ValidateLicense([FromBody] ValidateLicenseRequest request)
    {
        _logger.LogInformation("License validation request for key: {Key}", 
            request.LicenseKey?[..10] + "...");

        if (string.IsNullOrEmpty(request.LicenseKey))
        {
            return Ok(new ValidateLicenseResponse 
            { 
                Valid = false, 
                Error = "License key is required" 
            });
        }

        var license = await _context.Licenses
            .FirstOrDefaultAsync(l => l.Key == request.LicenseKey);

        if (license == null)
        {
            return Ok(new ValidateLicenseResponse 
            { 
                Valid = false, 
                Error = "Invalid license key" 
            });
        }

        if (license.ExpiresAt < DateTime.UtcNow)
        {
            return Ok(new ValidateLicenseResponse 
            { 
                Valid = false, 
                Error = "License expired" 
            });
        }

        if (license.ActivationsCount >= license.MaxActivations)
        {
            // Vérifier si c'est la même machine
            if (license.MachineIds?.Contains(request.MachineId) != true)
            {
                return Ok(new ValidateLicenseResponse 
                { 
                    Valid = false, 
                    Error = "Maximum activations reached" 
                });
            }
        }

        // Enregistrer l'activation
        license.ActivationsCount++;
        license.LastActivatedAt = DateTime.UtcNow;
        
        if (!string.IsNullOrEmpty(request.MachineId))
        {
            license.MachineIds ??= new List<string>();
            if (!license.MachineIds.Contains(request.MachineId))
            {
                license.MachineIds.Add(request.MachineId);
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new ValidateLicenseResponse
        {
            Valid = true,
            Plan = license.Plan,
            ExpiresAt = license.ExpiresAt,
            Features = GetFeaturesForPlan(license.Plan)
        });
    }

    private static List<string> GetFeaturesForPlan(string plan) => plan switch
    {
        "pro" => new() { "gf-plan", "gf-exec", "gf-status", "gf-abort", "efcore" },
        "team" => new() { "gf-plan", "gf-exec", "gf-status", "gf-abort", "efcore", "multi-repo", "support" },
        "enterprise" => new() { "all" },
        _ => new() { "gf-status" }
    };
}

public class ValidateLicenseRequest
{
    public string? LicenseKey { get; set; }
    public string? MachineId { get; set; }
}

public class ValidateLicenseResponse
{
    public bool Valid { get; set; }
    public string? Plan { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public List<string>? Features { get; set; }
    public string? Error { get; set; }
}
```

### Entity License

```csharp
// Models/License.cs
namespace AtlasHub.Models;

public class License
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Plan { get; set; } = "pro";  // pro, team, enterprise
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? LastActivatedAt { get; set; }
    public int ActivationsCount { get; set; }
    public int MaxActivations { get; set; } = 2;
    public List<string>? MachineIds { get; set; }
    public bool IsActive { get; set; } = true;
}
```

### Service de génération de clés

```csharp
// Services/LicenseKeyGenerator.cs
using System.Security.Cryptography;
using System.Text;

namespace AtlasHub.Services;

public class LicenseKeyGenerator
{
    private const string PREFIX = "CGFW";
    private const string CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private const string SECRET = "atlashub-cgf-2024";

    public string GenerateKey()
    {
        var random = RandomNumberGenerator.Create();
        var bytes = new byte[8];
        random.GetBytes(bytes);

        var part1 = GenerateSegment(bytes[..4]);
        var part2 = GenerateSegment(bytes[4..]);
        var checksum = GenerateChecksum(part1 + part2);

        return $"{PREFIX}-{part1}-{part2}-{checksum}";
    }

    private static string GenerateSegment(byte[] bytes)
    {
        var result = new char[4];
        for (int i = 0; i < 4; i++)
        {
            result[i] = CHARS[bytes[i] % CHARS.Length];
        }
        return new string(result);
    }

    private static string GenerateChecksum(string input)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(input + SECRET));
        return Convert.ToBase64String(hash)
            .Replace("+", "")
            .Replace("/", "")
            .Replace("=", "")[..4]
            .ToUpper();
    }

    public bool ValidateKeyFormat(string key)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(
            key, @"^CGFW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$"))
        {
            return false;
        }

        var parts = key.Split('-');
        var expectedChecksum = GenerateChecksum(parts[1] + parts[2]);
        return parts[3] == expectedChecksum;
    }
}
```

---

## 6. Simplifier l'accès (optionnel)

### Option A : Script d'installation public

Crée un script sur un repo public qui configure tout :

```bash
#!/bin/bash
# install-claude-gitflow.sh

echo "🔧 Configuration de l'accès à @atlashub/claude-gitflow..."

read -p "GitHub Personal Access Token (avec read:packages): " TOKEN

npm config set @atlashub:registry https://npm.pkg.github.com
echo "//npm.pkg.github.com/:_authToken=$TOKEN" >> ~/.npmrc

echo "📦 Installation..."
npm install -g @atlashub/claude-gitflow

echo "✅ Terminé ! Activez avec: claude-gitflow activate VOTRE-CLE"
```

Les utilisateurs font :
```bash
curl -s https://atlashub.ch/install-cgf.sh | bash
```

### Option B : Token d'accès public (read-only)

Tu peux créer un PAT dédié avec uniquement `read:packages` et le distribuer dans la documentation. C'est moins sécurisé mais plus simple pour les utilisateurs.

---

## 7. Checklist de publication

```
□ Créer le repo GitHub atlashub/claude-gitflow
□ Configurer le PAT avec write:packages
□ Build et test local (npm link)
□ Premier npm publish
□ Tester l'installation sur une autre machine
□ Configurer GitHub Actions pour CI/CD
□ Documenter le process d'installation utilisateur
□ Implémenter l'API de licence dans AtlasHub
□ Créer la page d'achat sur atlashub.ch
```

---

## Commandes utiles

```bash
# Voir les versions publiées
npm view @atlashub/claude-gitflow versions

# Voir les détails du package
npm view @atlashub/claude-gitflow

# Dépublier une version (attention : irréversible après 72h)
npm unpublish @atlashub/claude-gitflow@1.0.0

# Déprécier une version
npm deprecate @atlashub/claude-gitflow@1.0.0 "Use 1.0.1 instead"
```
