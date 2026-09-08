# {Screen Name} Screen Design Document

## Table of Contents

- [Revision History](#revision-history)
- [Overview](#overview)
- [Processing Flow](#processing-flow)
- [Screen Layout](#screen-layout)
- [Screen Item Definitions](#screen-item-definitions)
- [Operation Specifications](#operation-specifications)
- [Access Permissions](#access-permissions)
- [Routing Configuration](#routing-configuration)
- [Related Files](#related-files)

## Revision History

| Date | Version | Source Commit | Changes |
|------|---------|---------------|---------|
| YYYY-MM-DD | 1.0 | `abc1234` | Initial version |

## Overview

{Purpose and role of this screen in 1-3 sentences}

## Processing Flow

### Initial Display

1. **{Target} — {Action}**

   **File:** `{file path}`
   **Method:** `{method name}`

   {Processing description}

### Create

{Same format as above}

### Update

{Same format as above}

### Delete

{Same format as above}

## Screen Layout

{Embed wireframe image}

![{Screen Name} Wireframe](assets/{screen-name}-wireframe.png)

## Screen Item Definitions

| Item Name | Type | Default | Validation | Description |
|-----------|------|---------|------------|-------------|
| {item name} | {text/number/select/checkbox etc.} | {default} | {rules} | {description} |

## Operation Specifications

### {Button/Action Name}

- **Trigger:** {click/input/page load etc.}
- **Action:** {processing content}
- **On success:** {result}
- **On failure:** {error display}

## Access Permissions

| Role | Access | Data Scope |
|------|--------|------------|
| admin | Yes | All data |
| user | Yes | Own data only |

## Routing Configuration

| Type | Path | Description |
|------|------|-------------|
| Screen | `/...` | {screen display} |
| API | `/api/...` | {data retrieval} |

## Related Files

| Type | File Path | Description |
|------|-----------|-------------|
| Page | `src/pages/...` | {screen HTML/component} |
| Route | `src/routes/...` | {API endpoint} |
| Service | `src/services/...` | {business logic} |
