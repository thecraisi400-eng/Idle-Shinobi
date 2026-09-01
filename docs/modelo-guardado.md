# Modelo de Guardado y Persistencia — Ring de Campeones

**Versión del Esquema:** `schemaVersion: 1`  
**Ubicación:** `localStorage` / Archivo JSON de respaldo  

---

## 1. Claves de Almacenamiento Local (`localStorage`)

```text
ringDeCampeones.save.current     -> Estado actual serializado en JSON
ringDeCampeones.save.backup      -> Copia de seguridad del estado anterior válida
ringDeCampeones.installationId   -> Identificador único UUID de la instalación
```

---

## 2. Estructura Completa del Objeto de Estado (`GameState`)

```json
{
  "schemaVersion": 1,
  "profile": {
    "createdAt": 1756684800000,
    "heroName": "El Campeón del Pueblo",
    "classId": "heavy",
    "tutorialDone": true
  },
  "progression": {
    "level": 1,
    "exp": 0,
    "statPoints": 0,
    "skillPoints": 0,
    "chapter": 1,
    "fight": 1,
    "victories": 0,
    "defeats": 0,
    "statsPurchased": {
      "health": 0,
      "attack": 0,
      "defense": 0,
      "speed": 0
    }
  },
  "resources": {
    "gold": 500,
    "gems": 0,
    "materials": 0
  },
  "baseStats": {
    "health": 120,
    "attack": 18,
    "defense": 10,
    "speed": 10,
    "criticalChance": 0.05,
    "luck": 0,
    "dodge": 0.01,
    "accuracy": 0.95,
    "criticalResistance": 0.0,
    "criticalNullify": 0.0
  },
  "inventory": {
    "capacity": 50,
    "equipment": [
      {
        "uid": "eq_init_mask_01",
        "templateId": "mask_rookie",
        "slot": "head",
        "rarity": "common",
        "level": 0,
        "isLocked": false,
        "primary": { "health": 15 },
        "secondary": {},
        "setId": null,
        "rerolls": 0,
        "acquiredAt": 1756684800000
      }
    ],
    "materials": {
      "iron": 10,
      "leather": 5,
      "titanium": 0,
      "essence": 0
    },
    "consumables": []
  },
  "equipped": {
    "head": "eq_init_mask_01",
    "torso": null,
    "arms": null,
    "legs": null,
    "boots": null,
    "belt": null,
    "amulet": null
  },
  "skills": {
    "unlocked": {},
    "spent": 0
  },
  "campaign": {
    "currentEnemyId": "enemy_ch1_f1",
    "bossWins": 0
  },
  "events": {
    "dayKey": "2026-08-31",
    "order": [1, 4, 2, 6, 3, 5, 7],
    "progress": {},
    "history": []
  },
  "pvp": {
    "activeTournament": null,
    "recentChampions": []
  },
  "missions": {
    "dayKey": "2026-08-31",
    "weekKey": "2026-W36",
    "daily": [],
    "weekly": []
  },
  "achievements": {
    "progress": {},
    "claimed": []
  },
  "shop": {
    "dayKey": "2026-08-31",
    "weekKey": "2026-W36",
    "offers": []
  },
  "loginCalendar": {
    "lastClaimKey": "2026-08-31",
    "day": 1
  },
  "inbox": [],
  "settings": {
    "textSize": "normal",
    "quality": "medium",
    "reducedMotion": false,
    "musicVolume": 0.5,
    "effectsVolume": 0.7,
    "vibration": true
  },
  "meta": {
    "lastSavedAt": 1756684800000,
    "lastKnownTimestamp": 1756684800000,
    "playTimeSeconds": 0
  }
}
```

---

## 3. Protocolo Atómico de Guardado y Recuperación

1. **Clonación profunda y Validación:** Antes de persistir, se valida la estructura mediante validadores estrictos (`validators.js`). No se permiten valores `NaN`, infinitos ni saldos negativos.
2. **Rotación de Copia de Seguridad:**
   - El contenido previo de `ringDeCampeones.save.current` se copia en `ringDeCampeones.save.backup`.
3. **Escritura Atómica:**
   - Se serializa y escribe el nuevo estado en `ringDeCampeones.save.current`.
4. **Verificación Inmediata:**
   - Se realiza una lectura de comprobación (`JSON.parse`). Si falla o se detecta corrupción, se restaura inmediatamente la copia de `ringDeCampeones.save.backup`.
5. **Protección Anti Time-Drift:**
   - Se compara `Date.now()` con `meta.lastKnownTimestamp`. Si se detecta un salto hacia atrás mayor a 1 hora, se ajustan los temporizadores internos para prevenir errores en eventos diarios.
