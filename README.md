# Tasks of my Life

A task list for a whole life


## Usage

Start server

	cd server
	npm run serve

Start client

	cd client
	npm run serve

Open browser and navigate to http://localhost:8080/


## Componentes

### Client

The Tasks of my Life client, a web application based on vue.js

Inspired by https://vuejs.org/v2/examples/tree-view.html

### Server

The Tasks of my Life server, a REST API based on express.js

### Data

The underlying file system based data store. Each task is stored as a markdown file. Metadata is stored as frontmatter.

#### Storage Conventions

Pattern:

	<status><node-id>-<title>.md

Parameters:

- `<status>` is either:
	- `todo`: indicated by empty string
	- `done`: indicated by `.` (dot) with the intention to hide the file
- `<node-id>` is the ID of the task
- `<title>` is the title of the task in lower case with all special characters replaced by `-` (dash)


## Ideas

- Wrap underlying file system with git version control
- Consider alternative persistance providers:
	- AWS S3
	- Github Issues
