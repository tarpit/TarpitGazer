# Visualizing the Turing Tarpit

This project visualizes the behavior of many [Jot](http://semarch.linguistics.fas.nyu.edu/barker/Iota/) programs simultaneously. Each circle in the visualization represents a program, and its size and color reflect execution time. Non-terminating programs are marked in black.

The visualization uses a [Hilbert Curve](https://en.wikipedia.org/wiki/Hilbert_curve) to map random bit strings (Jot programs) onto a 2D plane.

## Project Overview

- **Visualization Description**: Programs are represented as circles whose size and color evolve over time. Longer programs tend to execute slower, causing visual growth of the circles.
- **Background**: For further details, see our [submission to FARM 2013](jot-visualization.pdf).

## Installation

This project includes JavaScript and CSS dependencies that are included locally, so no additional setup is required.

### How to Run
1. Open the `index.html` file in your browser by double-clicking it or dragging it into a browser window.
2. The visualization should load and run automatically.

## Third-Party Libraries

### Bootstrap
- **Source**: [https://getbootstrap.com/](https://getbootstrap.com/)
- **File**: `bootstrap/css/bootstrap.min.css`
- **Purpose**: Provides responsive styling and layout.

### jQuery
- **Version**: 1.10.2
- **Source**: [https://jquery.com/](https://jquery.com/)
- **File**: `./js/jquery-1.10.2.min.js`
- **Purpose**: Simplifies DOM manipulation and event handling.

### jQzoom Plugin
- **Source**: [https://github.com/hardywalker/jQzoom](https://github.com/hardywalker/jQzoom)
- **File**: `./js/jquery.jqzoom-core-pack.js`
- **Downloaded**: [Specify date when downloaded]
- **Purpose**: Provides zooming functionality for interactive elements.
- **Notes**: This file is unmodified from its original source.

## Authors

- [Eric Holk](http://blog.theincredibleholk.org)
- [Jason Hemann](http://hemann.pl)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

---

For questions or feedback, feel free to contact the authors.
