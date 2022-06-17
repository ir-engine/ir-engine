---
name: Bug report
about: Create a report to help us improve
title: '[Bug]: '
labels: '[bug]'
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
      description: What operating system is XREngine running on?
    validations:
      required: true
  - type: input
    id: browser
    attributes:
      label: Browser (if applicable)
      description: What browser did this occur on? (including version number)
    validations:
      required: false
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Please clearly describe the issue you are facing, including any screenshots that may be helpful.
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: Steps to reproduce
      description: 
      render: shell
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Relevant log output
      description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
      render: shell
    validations:
      required: false

---
