---
name: Feature Request
about: Suggest a new feature or enhancement
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## ✨ Feature Description

A clear and concise description of the feature you'd like to see.

## 🎯 Problem / Use Case

Describe the problem this feature would solve or the use case it addresses.

**Example:**
> As a server administrator, I want to be able to [do something] so that I can [achieve some goal].

## 💡 Proposed Solution

Describe how you'd like this feature to work.

### Tool Definition (if applicable)

If this is a new MCP tool, describe the expected interface:

```typescript
{
  name: "category_action",
  description: "What the tool does",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Description"
      }
    },
    required: ["param1"]
  }
}
```

### Expected Behavior

Describe the expected input/output:

**Input:**
```json
{
  "param1": "value"
}
```

**Output:**
```json
{
  "success": true,
  "data": {}
}
```

## 🔄 Alternatives Considered

Describe any alternative solutions or features you've considered.

## 📊 Priority

How important is this feature to you?

- [ ] 🔴 Critical - Blocking my work
- [ ] 🟠 High - Significantly impacts productivity
- [ ] 🟡 Medium - Would be nice to have
- [ ] 🟢 Low - Minor improvement

## 📝 Additional Context

Add any other context, screenshots, or examples about the feature request here.

## 🙋 Willingness to Contribute

- [ ] I'm willing to submit a PR for this feature
- [ ] I can help with testing
- [ ] I can help with documentation

## ✔️ Checklist

- [ ] I have searched existing issues/features to ensure this is not a duplicate
- [ ] I have provided a clear use case for this feature
- [ ] This feature aligns with the project's goals
