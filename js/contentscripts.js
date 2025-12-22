(function() {
    var DEBUG = true;

    var onKeyDown = function(event) {
        // Push "w" key (without modifiers to avoid conflicts)
        if (event.keyCode == 87 && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
            if (DEBUG) console.log("Inoreader Star Opener: 'w' key detected!");

            // Ignore if user is typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
                if (DEBUG) console.log("Inoreader Star Opener: Ignored - user is typing in an input field");
                return;
            }

            chrome.runtime.sendMessage({method: "getOptions"}, function(response) {
                var tab_count = response.iso_tabcount;

                if (DEBUG) console.log("Inoreader Star Opener: Opening up to " + tab_count + " tabs");

                // Inoreader uses different selectors - these will need to be verified
                // This is a placeholder that should work with common Inoreader layouts

                // Try to find article links in starred items
                // Inoreader typically uses classes like 'article_title_link' or similar
                var possibleSelectors = [
                    'a.article_magazine_title_link',  // Magazine view title link
                    'a.article_title_link',  // Common selector for article links
                    'a.article_link',
                    '.article_item a[href^="http"]',
                    '.article a.article_title'
                ];

                var articles = [];

                // Try each selector until we find articles
                for (var selectorIndex = 0; selectorIndex < possibleSelectors.length; selectorIndex++) {
                    if (DEBUG) console.log("Trying selector: " + possibleSelectors[selectorIndex]);
                    var links = document.querySelectorAll(possibleSelectors[selectorIndex]);
                    if (DEBUG) console.log("  -> Found " + links.length + " links");
                    if (links.length > 0) {
                        if (DEBUG) console.log("Found " + links.length + " links using selector: " + possibleSelectors[selectorIndex]);

                        // Filter to get unique articles and find their star buttons
                        var seenUrls = new Set();
                        for (var i = 0; i < links.length && articles.length < tab_count; i++) {
                            var link = links[i];
                            var url = link.href;

                            // Skip if we've already seen this URL or if it's not a valid http(s) URL
                            if (seenUrls.has(url) || (!url.startsWith('http://') && !url.startsWith('https://'))) {
                                continue;
                            }

                            // Find the article container (parent element that contains both link and star button)
                            var articleElement = link.closest('.article');
                            if (!articleElement) {
                                // Try alternative parent selectors
                                articleElement = link.closest('[id^="article_"]');
                            }

                            if (DEBUG && i === 0) {
                                console.log("Debug: First article element:");
                                console.log("  Link:", link);
                                console.log("  Article container:", articleElement);
                                if (articleElement) {
                                    console.log("  Article HTML:", articleElement.outerHTML.substring(0, 500));
                                }
                            }

                            // Find the star button within the article container
                            var starButton = null;
                            var isStarred = false;
                            if (articleElement) {
                                // Look for the star button - it's inside .article_btns with class star_full
                                var starImg = articleElement.querySelector('.star_full');
                                if (DEBUG && i === 0) {
                                    console.log("  Star image element:", starImg);
                                }
                                if (starImg) {
                                    // Get the parent <a> element that has the onclick handler
                                    starButton = starImg.closest('a');
                                    // Check if the star is actually filled (yellow) - this means it's starred
                                    isStarred = starImg.classList.contains('icon-yellow');
                                    if (DEBUG && i === 0) {
                                        console.log("  Star button:", starButton);
                                        console.log("  Is starred:", isStarred);
                                    }
                                }
                            }

                            // Skip this article if it's not starred
                            if (!isStarred) {
                                if (DEBUG) console.log("  Skipping unstarred article: " + link.textContent.trim().substring(0, 30));
                                continue;
                            }

                            seenUrls.add(url);
                            articles.push({
                                url: url,
                                title: link.textContent.trim(),
                                starButton: starButton
                            });
                        }

                        if (articles.length > 0) {
                            break;  // Found articles, no need to try other selectors
                        }
                    }
                }

                if (articles.length === 0) {
                    console.warn("Inoreader Star Opener: No articles found. Please check the page structure.");

                    // Fallback: try to find any links that might be articles
                    var allLinks = document.querySelectorAll('a[href^="http"]');
                    console.log("Inoreader Star Opener: Fallback - found " + allLinks.length + " total http(s) links on page");

                    // Also try to find all links
                    var allLinksAny = document.querySelectorAll('a');
                    console.log("Inoreader Star Opener: Total <a> tags on page: " + allLinksAny.length);

                    // Log some links for debugging
                    if (allLinks.length > 0) {
                        console.log("Sample http(s) links (first 10):");
                        for (var j = 0; j < Math.min(10, allLinks.length); j++) {
                            var link = allLinks[j];
                            console.log("  [" + j + "] class='" + link.className + "' href='" + link.href + "'");
                            console.log("      text: " + link.textContent.trim().substring(0, 50));
                        }
                    }
                } else {
                    if (DEBUG) console.log("Opening " + articles.length + " articles");

                    // Open articles in background tabs and unstar them
                    for (var k = 0; k < articles.length; k++) {
                        var article = articles[k];

                        // Open the article in a new tab
                        window.open(article.url);

                        // Unstar the article by clicking the star button
                        if (article.starButton) {
                            if (DEBUG) console.log("Unstarring article: " + article.title.substring(0, 30));
                            article.starButton.click();
                        } else {
                            if (DEBUG) console.log("Warning: Could not find star button for: " + article.title.substring(0, 30));
                        }
                    }
                }
            });
        }
    };

    document.addEventListener('keydown', onKeyDown, false);

    if (DEBUG) console.log("Inoreader Star Opener: Content script loaded");
})();
