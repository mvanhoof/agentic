# Spec Delta

## Purpose

Lets a visitor to the Collection page narrow the displayed machines to one
manufacturer at a time, without a full page reload.

## ADDED Requirements

### Requirement: Manufacturer filter control
The Collection page SHALL display a filter control listing "All" plus every
distinct manufacturer present across the machine collection, derived at
build time.

#### Scenario: Filter options reflect the collection
- **WHEN** the Collection page is built
- **THEN** the filter control lists "All" and one option per distinct
  `manufacturer` value found across all machine entries, with no duplicates

### Requirement: Filtering hides non-matching machines
Selecting a manufacturer in the filter control SHALL hide, in both the
"Current Collection" and "Previously Owned" sections, every machine card
whose `manufacturer` does not match the selection, without navigating to a
different page.

#### Scenario: Selecting a manufacturer
- **WHEN** a visitor selects manufacturer "Bally" from the filter control
- **THEN** only machine cards with `manufacturer` "Bally" remain visible in
  the Current Collection section
- **AND** only machine cards with `manufacturer` "Bally" remain visible in
  the Previously Owned section

#### Scenario: Selecting "All" shows every machine
- **WHEN** a visitor selects "All" from the filter control
- **THEN** every machine card is visible in both sections

### Requirement: Filtering degrades gracefully without JavaScript
When JavaScript is unavailable or fails to load, the Collection page SHALL
still display every machine in both sections; the filter control MAY be
absent or non-functional, but SHALL NOT hide any machine.

#### Scenario: JavaScript disabled
- **WHEN** a visitor loads the Collection page with JavaScript disabled
- **THEN** every machine card is visible in both the Current Collection and
  Previously Owned sections
