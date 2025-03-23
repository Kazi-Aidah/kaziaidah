const API_KEY = 'AIzaSyDB9GX4GitTAFo-6c16157dMY64TiMX6-E'; // Your actual YouTube API key
let currentPlaylistId = 'PLJYnzg7Cheugz3JzxOIkcKNwVmVvwoObd'; // Default Playlist ID
let currentPage = 1; // Track the current page
let totalPages = 0; // Total pages calculated dynamically
let nextPageTokens = []; // Store API nextPageTokens for pagination

const videoGrid = document.getElementById('video-grid');
const paginationControls = document.getElementById('pagination-controls');
const MAX_VIDEOS_PER_PAGE = 48; // Number of videos per page (maximum limit)
const MIN_VIDEOS_PER_PAGE = 1; // Minimum limit for videos per page

// Define Playlist IDs for each filter
const playlistIds = {
    'Beginner Friendly': 'PLJYnzg7CheujMlNygnUKt8yE1oxS_GaTb',
    'Useful': '',  // Placeholder for "Useful" (not available)
    'Head/Body Turns': 'PLJYnzg7Cheug0BL2gRM7xPEq3iOYzkeX5',
    'Facial': 'PLJYnzg7CheujyYrdS89yOF_J3v-IIB7iU',
    'Eyes': 'PLJYnzg7Cheug-vg5tZh7bkws7ziWurx2L',
    'Mouth': 'PLJYnzg7CheujFMXS6lHxgsMDxALKLIjeR',
    'Walking/Running': 'PLJYnzg7CheugMYOs-L9i2jVtVxb4iF-Ff',
    'Vector Drawing': 'PLJYnzg7CheuihOe23r0qiFPw1nbjTOVmy',
    'Hand': 'PLJYnzg7Cheuh5Pn0LQDKnGnzHjKLNmtHH',
    'Vehicle': 'PLJYnzg7CheugIs8W8kWf0nBCHlordaY2Q',
    'Wings': 'PLJYnzg7Cheui8N4jQKjvFXmWfn6QZXvfK',
    'Separation': 'PLJYnzg7CheugwlOepehdshjYVX4MW0UyT',
    'Front Facing': 'PLJYnzg7Cheug8J328soWAwxN2V9yZtIft',
    'Teleportation/Magical': 'PLJYnzg7CheugPf4yjzS_zRCqv2LOP_NMM',
    'Alight Motion': 'PLJYnzg7Cheuhn-eX2wZs9G7g4J4ZNyegU',
    'Moho Pro': '',  // No playlist ID for Moho Pro
    'IbisPaint X': 'PLJYnzg7CheugO1qfRsP83bAsE2kG-EWG1',
    'Other Apps': '',  // No playlist ID for Other Apps
    'Live2D Cubism': 'PLJYnzg7CheuiUNKI0Q_8tUPipgspR5hpO',
    'All Tutorials': 'PLJYnzg7Cheugz3JzxOIkcKNwVmVvwoObd',
};

// Fetch Videos for the Current Page
async function fetchVideosForPage(page) {
    if (!currentPlaylistId) {
        videoGrid.innerHTML = '<p>No Playlist has been linked.</p>';
        return;
    }

    const pageToken = nextPageTokens[page - 1] || ''; // Get token for the selected page
    try {
        videoGrid.innerHTML = '<p>Loading videos...</p>'; // Show loading indicator
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${currentPlaylistId}&maxResults=${MAX_VIDEOS_PER_PAGE}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`;
        
        console.log('Requesting URL:', url); // Log the URL being requested

        const response = await fetch(url);
        const data = await response.json();

        console.log('Fetched Data:', data); // Log the response data

        if (response.ok) {
            displayVideos(data.items); // Show videos for this page

            if (!totalPages && data.pageInfo?.totalResults) {
                totalPages = Math.ceil(data.pageInfo.totalResults / MAX_VIDEOS_PER_PAGE); // Calculate total pages
                createPaginationControls(); // Initialize pagination
            }

            if (data.nextPageToken) {
                nextPageTokens[page] = data.nextPageToken; // Save token for next page
            }

            console.log('Current Page:', currentPage, 'Next Page Tokens:', nextPageTokens);

            updatePaginationHighlight(); // Ensure pagination highlight is updated
        } else {
            console.error(`Error fetching videos: ${data.error.message}`);
            videoGrid.innerHTML = `<p>Error: ${data.error.message}</p>`;
        }
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        videoGrid.innerHTML = '<p>Failed to load videos. Please try again later.</p>';
    }
}

// Display Videos on the Grid
function displayVideos(videos) {
    videoGrid.innerHTML = ''; // Clear previous videos
    videos.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;
        const videoTitle = item.snippet.title;
        const videoThumbnail = item.snippet.thumbnails.high.url;

        const videoElement = document.createElement('div');
        videoElement.classList.add('video');
        videoElement.innerHTML = `
            <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                <img src="${videoThumbnail}" alt="${videoTitle}" style="width: 100%; height: auto; border-radius: 6px;">
            </a>
            <p>${videoTitle}</p>
        `;
        videoGrid.appendChild(videoElement);
    });
}

// Create Pagination Controls
function createPaginationControls() {
    paginationControls.innerHTML = ''; // Clear previous controls

    // Add Page Number Buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.add('pagination-btn');
        if (i === currentPage) {
            pageButton.classList.add('active'); // Highlight current page
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fetchVideosForPage(currentPage); // Fetch selected page videos
            updatePaginationHighlight(); // Update highlight
        });
        paginationControls.appendChild(pageButton);
    }

    // Add "Next" Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.classList.add('pagination-btn');
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchVideosForPage(currentPage); // Fetch next page videos
            updatePaginationHighlight(); // Update highlight
        }
    });
    paginationControls.appendChild(nextButton);
}

// Helper Function: Update Pagination Highlight
function updatePaginationHighlight() {
    const buttons = paginationControls.querySelectorAll('.pagination-btn');
    buttons.forEach(button => button.classList.remove('active')); // Remove active class from all buttons

    // Highlight the current page button
    const currentPageButton = Array.from(buttons).find(
        button => button.textContent === String(currentPage)
    );
    if (currentPageButton) {
        currentPageButton.classList.add('active');
    }
}

// Highlight Search Results
function highlightSearch(query) {
    // Get all video titles on the page
    const videoElements = document.querySelectorAll('.video p');

    if (!videoElements.length) {
        console.warn('No videos to search.');
        return;
    }

    videoElements.forEach(videoElement => {
        const videoTitle = videoElement.textContent;

        // Check if the query matches part of the title
        if (videoTitle.toLowerCase().includes(query.toLowerCase())) {
            // Highlight the matching text
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedTitle = videoTitle.replace(regex, '<span class="highlight">$1</span>');
            videoElement.innerHTML = highlightedTitle; // Update HTML content
        } else {
            // Remove highlights if the query doesn't match
            videoElement.innerHTML = videoTitle;
        }
    });
}

// Filter button event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchVideosForPage(currentPage); // Load the first page

    const searchInput = document.querySelector('.search-input');

    // Dynamically create Search button
    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Search';
    searchBtn.classList.add('search-btn');
    searchInput.insertAdjacentElement('afterend', searchBtn);

    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) highlightSearch(query);
        else alert('Enter search text first.');
    });

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.getAttribute('data-filter');

            if (playlistIds[filter]) {
                currentPlaylistId = playlistIds[filter] || currentPlaylistId;
                fetchVideosForPage(currentPage); // Fetch videos for selected filter
            } else {
                console.log(`No playlist ID found for: ${filter}`);
                videoGrid.innerHTML = '<p>No Playlist has been linked for this category.</p>';
            }
        });
    });

    // Sidebar toggle functionality
    const toggleButton = document.getElementById('toggle-button');
    const sidebar = document.querySelector('.sidebar');

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open');
        });
    } else {
        console.warn('Toggle button not found.');
    }
});
