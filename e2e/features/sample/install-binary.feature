Feature: Install Skid Binary

  Scenario: Install Skid Binary
    Given the Skid Binary is published
    When the user installs the Skid Binary
    Then the user should be able to run skid