---
name: Installation Tech Support
about: I'm having difficulty installing XREngine
title: '[Ticket]: '
labels: '[ticket]'
assignees: ''

body:
  - type: markdown
    attributes:
      value: |
        Thanks for using XREngine! Let's figure out the problem.
  - type: input
    id: os
    attributes:
      label: Operating System
      description: What operating system are you trying to install on?
      placeholder: 
    validations:
      required: true
  - type: input
    id: nodev
    attributes:
      label: Node Version
      description: What nodejs version are you using? (run `node -v` if you are unsure)
      placeholder: 
    validations:
      required: true
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Please describe the issue you are facing.
      placeholder: 
      value: ""
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Relevant log output
      description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
      render: shell

---