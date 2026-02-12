

# IoT Student Portal and Content Management System

This repository hosts a comprehensive web application designed for Internet of Things (IoT) students. It functions as both a student resource portal and a serverless Content Management System (CMS) that allows administrators to manage site content directly through the browser using the GitHub API.

## Project Overview

The application is built with a static architecture, meaning it requires no backend server database. All data is stored in JSON files within the repository. The platform provides two distinct interfaces:

1. **Student Portal:** A public-facing interface for accessing curriculum details, study materials, and academic tools.
2. **Admin Editor:** A restricted interface that allows authorized users to update the JSON data files (books, videos, quizzes) directly from the web browser without cloning the repository.

## Key Features

### Student Portal

* **Course Catalog:** An interactive curriculum guide displaying course codes, credit hours, prerequisites, and descriptions. It supports filtering by category (e.g., University Requirement, Major Compulsory) and includes a toggle for dark/light mode.
* **Digital Library:** A searchable resource repository for books. Users can filter by categories such as IoT, AI, and Programming, view book details, and access download links.
* **Video Gallery:** A dedicated section for educational video tutorials, supporting sorting by date or author and direct playback embedding.
* **Advanced GPA Calculator:** A specialized tool for academic planning. It supports custom weight systems (New vs. Old) and handles repeated course logic to forecast GPA changes accurately.

### Admin Editor (CMS)

* **Unified JSON Editor:** A graphical interface to modify the data files (`books.json`, `videos.json`, `quiz.json`, `course_links.json`) without writing code.
* **GitHub API Integration:** Connects directly to the repository using a Personal Access Token. It allows administrators to load current data, make edits, and commit/push changes back to the main branch securely from the client side.
* **Image Compression:** Automatically resizes and compresses images to Base64 format (max width 800px, JPEG quality 0.7) before saving them to the data files, ensuring optimal performance.

## Technical Structure

The project relies on standard web technologies and a flat-file database structure:

* **Frontend:** HTML5, CSS3, JavaScript (ES6+).
* **Styling:** Custom CSS with Bootstrap 5 integration for responsive components and modals.
* **Data Storage:** JSON files serve as the database.
* `courses.json`: Stores curriculum data.
* `books.json`: Stores library inventory.
* `course_links.json`: Maps external resources to specific courses.
* `quiz.json`: Stores question banks and answers.



## Setup and Usage

### Running the Student Portal

This project is designed to be hosted on static hosting services like GitHub Pages. No build process is required. Simply enable GitHub Pages in your repository settings and point it to the root directory.

### Using the Admin Editor

1. Navigate to `editor.html` in your browser.
2. Select the content type you wish to edit (e.g., Books, Videos) from the dropdown menu.
3. **Authentication:** To save changes, you must provide a GitHub Personal Access Token with `repo` scope in the "GitHub Token" field.
4. **Workflow:**
* Click **Load** to fetch the latest data from the repository.
* Add, edit, or remove items using the interface.
* Click **Push** to commit the changes back to the repository.



## Configuration

The editor behavior is controlled by the `EDITOR_CONFIG` object in `app.js`. You can modify this configuration to add new data files or change the display labels for the editor interface.
