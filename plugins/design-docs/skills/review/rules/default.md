# Design Document Writing Rules

Rules checked during design document review.

---

## Always Apply (code present or not)

### 1. Terse Style

No polite/formal language. Use terse, factual style.

**English:** Use imperative/noun phrases. No "is created", "will be issued".
```
# NG
The user is created. A token is issued.

# OK
Create user and issue token
```

**Japanese (体言止め):** No です/ます/いたします. Use noun-ending or する/される style.
```
# NG
ユーザーを作成します。トークンを発行いたします。

# OK
ユーザーを作成し、トークンを発行
```

### 2. Mermaid Diagrams

Use mermaid for flow diagrams, sequence diagrams, and ER diagrams. No image files (png/jpg) or PlantUML.

When data flows between 2+ components, include a mermaid sequenceDiagram in the processing flow section.

### 3. No Unnecessary Wrapper Headings

Don't create headings with no content. Place each section directly at `##` level.

```
# NG
## API Details
### Token API
### User Registration API

# OK
## Token API
## User Registration API
```

### 4. Overview First, Details Later

Section order: Overview → Processing Flow (diagram) → Detailed Specs.

```
# NG — detail tables before flow diagram
## Overview
## Variable List
## Processing Flow

# OK — flow diagram shows the big picture first
## Overview
## Processing Flow
## Variable List
```

---

## Code Present Only

### 5. Table.Column Format

All column references must use `table_name.column_name` format.

```
# NG
Search by `id`
When `status` is completed

# OK
Search by `user.id`
When `user.status` is active
```

### 6. Source Attribution

Always specify the source of conditions and values (table name, constant name, environment variable name, config key, etc.).

**Basic example:**
```
# NG
Delete when retention period exceeded

# OK
Delete when `RETENTION_DAYS` (env var, default: 30) exceeded
```

**DB column reference:**
```
# NG
Filter by user status

# OK
Filter by `user.status = 'active'`
```

**Composite condition (name the composite):**
```
# NG
Allow if user is authenticated and has permission

# OK
Allow if `isAuthorized = isAuthenticated(user) AND hasPermission(user, resource)`
```

**Derived value (show the derivation):**
```
# NG
Calculated total

# OK
Total = sum of `order.items[].price` minus `order.discountAmount`
```

**Configuration-driven logic:**
```
# NG
Skip if disabled in config

# OK
Skip if `config.features.autoSync` is `false` (from `config/features.yml`)
```

**Framework default or magic value:**
```
# NG
Default page size

# OK
Default page size: 20 (from `DEFAULT_PAGE_SIZE` constant in `src/config.ts`)
```

### 7. Implementation Location

Always include the corresponding file path and method name for processing descriptions.

```
# NG
Execute user creation process

# OK
**File:** `src/services/UserService.js`
**Method:** `createUser()`

Create user record
```

### 8. Unified Endpoint Format

Each API detail section must use this unified format:

```markdown
## {API Name}

| Item | Value |
|------|-------|
| Method | POST |
| Path | `/api/users` |
| Auth | JWT |

### Request Parameters
### Response (Success)
### Error Response
### Processing Flow
```

### 9. JSON Samples Based on Implementation

Response JSON samples must be based on actual source code implementation, not imagination or documentation copies.

### 10. Unified Numbered Item Format

When listing sequential steps or modifications, use this format:

```markdown
1. **{Target} — {Action}**

   **File:** `{file path}`
   **Method:** `{method name}`

   {Description}
```

### 11. No Separate Implementation Locations Section

File/method info goes inside the numbered list per rule 10. Don't create a separate `## Implementation Locations` table section (avoids information duplication).

---

## Quality Checklist

Check all during review:

**Always check:**
- [ ] Terse style is consistent (no polite/formal language mixed in)
- [ ] Flow diagrams use mermaid
- [ ] No unnecessary wrapper headings
- [ ] Processing flow diagram placed right after overview
- [ ] Required sections exist (table of contents, revision history, overview)
- [ ] Section order follows template

**Additional checks when code is present:**
- [ ] All column references have `table_name.` prefix
- [ ] Sources of conditions and values are specified
- [ ] Implementation locations (file path, method name) are specified
- [ ] Endpoint definitions match source code
- [ ] Parameters and validation match source code
- [ ] JSON samples are based on implementation
- [ ] Numbered items use unified format
- [ ] No redundant implementation locations section
- [ ] Revision history includes source commit hash
