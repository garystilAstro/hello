// Function to initialize PDF.js and load the PDF file
function loadPdf(url) {
    const pdfContainer = document.getElementById('pdf-container');

    // Check if the browser supports PDF.js
    if (!window.pdfjsLib) {
        console.error('PDF.js library is not loaded.');
        return;
    }

    // Check if the browser is iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
        // For iOS Safari, use an <iframe> element to render PDF
        const iframe = document.createElement('iframe');
        iframe.src = `https://docs.google.com/viewer?url=${url}&embedded=true`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none'; // Remove iframe border
        pdfContainer.appendChild(iframe);
    } else {
        // For other browsers, use PDF.js
        window.pdfjsLib.getDocument(url).promise
            .then(function(pdfDoc) {
                // Load the first page
                pdfDoc.getPage(1).then(function(page) {
                    // Calculate viewport width and height based on the device's screen size
                    const screenWidth = window.screen.width;
                    const screenHeight = window.screen.height;

                    // Determine the maximum width and height for the canvas
                    const maxWidth = Math.min(screenWidth, 16384); // Adjust as needed
                    const maxHeight = Math.min(screenHeight, 16384); // Adjust as needed

                    // Calculate the scale factor to fit within the maximum dimensions
                    const viewport = page.getViewport({ scale: 1 });
                    const scaleFactor = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);

                    // Calculate the viewport dimensions with the adjusted scale factor
                    const viewportWidth = viewport.width * scaleFactor;
                    const viewportHeight = viewport.height * scaleFactor;

                    // Create a canvas element with the adjusted dimensions
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    canvas.width = viewportWidth;
                    canvas.height = viewportHeight;

                    // Append the canvas to the PDF container
                    pdfContainer.appendChild(canvas);

                    // Render the PDF page onto the canvas
                    const renderContext = {
                        canvasContext: context,
                        viewport: page.getViewport({ scale: scaleFactor }),
                    };
                    page.render(renderContext).promise.then(function() {
                        console.log('Page rendered');
                    }).catch(function(error) {
                        console.error('Error rendering page:', error);
                    });

                    // Center the document horizontally
                    const marginLeft = (pdfContainer.clientWidth - viewportWidth) / 2;
                    canvas.style.marginLeft = `${marginLeft}px`;

                    // Make the document vertically scrollable if necessary
                    if (viewportHeight > screenHeight) {
                        pdfContainer.style.overflowY = 'scroll';
                    }
                });
            })
            .catch(function(error) {
                console.error('Error loading PDF:', error);
            });
    }
}

// Call the loadPdf function with the URL of your PDF file
loadPdf('astrolabe-sketches.pdf');