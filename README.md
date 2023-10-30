# Multi-Container Account Manager for Firefox

## Description

This Firefox extension allows you to manage multiple container tabs. You can delete existing containers, extract container information to a CSV file, and create new containers from a CSV file.


## DEMO


## Features

- **Delete Existing Containers**: Remove all existing containers.
- **Extract Existing Containers**: Export information of existing containers to a CSV file.
- **Create Containers from CSV**: Upload a CSV file to create new containers with optional URLs, emails, and passwords.

## Prerequisites

- Firefox Browser
- Firefox Multi-Container Account https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/

## Installation

1. Clone this repository or download the ZIP file.
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click on "Load Temporary Add-on" and select the `manifest.json` from this project's directory.

## Usage

### Deleting Existing Containers

1. Click on the extension icon.
2. Click the "Delete Existing Containers" button.

### Extracting Existing Containers

1. Click on the extension icon.
2. Click the "Extract Existing Containers" button.
3. A CSV file named `existing_containers.csv` will be downloaded.

### Creating Containers from a Textarea Input (CSV formatted)

1. Click on the extension icon.
2. Paste your CSV content into the textarea.
3. Click the "Upload" button.

## CSV Format

The CSV should have the following columns:

- `name`: Container name
- `url`: (Optional) URL to open in the container
- `email`: (Optional) Email to autofill
- `password`: (Optional) Password to autofill
- `color`: (Optional) Container color
- `icon`: (Optional) Container icon

Example:
```
name,url,email,password,color,icon
GithubA,https://github.com/login,email@gmail.com,password123,red,fingerprint
GithubB,https://github.com/login,email2@gmail.com,password123,blue,fingerprint
```

## Troubleshooting

If you encounter any issues related to permissions, ensure that you have correctly set the permissions in the `manifest.json` file.

