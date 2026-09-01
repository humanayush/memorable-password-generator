document.addEventListener("DOMContentLoaded", function () {

    // Our 8-question pool (final locked list)
    let questions = [
        "A fictional character you relate to most, as an adult?",
        "What was the name of your first bike?",
        "What's your nickname?",
        "Your dream travel destination (never been, but want to go)?",
        "Favorite childhood cartoon or TV show character?",
        "Name of your first best friend (childhood)?",
        "Your childhood best-loved toy or game?",
        "Favorite food as a child?"
    ];

    // Build the HTML for all 8 question cards
    let result = "";
    for (let i = 0; i < questions.length; i++) {
        result += "<div class='question-card' data-index='" + i + "'>" + questions[i] + "</div>";
    }

    // Insert into the page
    document.getElementById("question-pool").innerHTML = result;

    // Navigation: Landing -> Questions
    document.getElementById("start-btn").addEventListener("click", function () {
        document.getElementById("landing").classList.remove("active");
        document.getElementById("questions").classList.add("active");
    });

    // Selection tracking setup
    let selected = [false, false, false, false, false, false, false, false];
    let selectedCount = 0;
    let finalPassword = "";

    // Diceware-style word list (small curated set, adds independent unguessable entropy)
    let wordList = [
        "river", "tiger", "cloud", "storm", "maple", "ember", "quartz", "willow",
        "falcon", "meadow", "granite", "harbor", "lantern", "orchid", "canyon",
        "thunder", "velvet", "amber", "cedar", "frost", "coral", "jasper",
        "marble", "ripple", "shadow", "sparrow", "timber", "violet", "zephyr", "copper"
    ];

    // Site name suggestions for the custom dropdown
    let siteSuggestion = ["Netflix", "Gmail", "Instagram", "Amazon", "Facebook", "Twitter / X", "LinkedIn", "GitHub", "Spotify", "WhatsApp"];

    document.getElementById("site-name").addEventListener("input", function () {
        let typedText = document.getElementById("site-name").value;
        let matches = siteSuggestion.filter(function (name) {
            return name.toLowerCase().includes(typedText.toLowerCase());
        });

        let finalSiteName = "";
        for (let i = 0; i < matches.length; i++) {
            finalSiteName += "<div class='site-option' data-index='" + i + "'>" + matches[i] + "</div>";
        }
        document.getElementById("site-dropdown").innerHTML = finalSiteName;

        if (matches.length > 0 && typedText.trim() !== "") {
            document.getElementById("site-dropdown").classList.add("visible");
        } else {
            document.getElementById("site-dropdown").classList.remove("visible");
        }
    });

    // Clicking a suggestion fills the input and closes the dropdown
    document.getElementById("site-dropdown").addEventListener("click", function (event) {
        if (event.target.classList.contains("site-option")) {
            document.getElementById("site-name").value = event.target.textContent;
            document.getElementById("site-dropdown").classList.remove("visible");
        }
    });

    // Clicking anywhere outside the input/dropdown closes the dropdown
    document.addEventListener("click", function (event) {
        let dropdown = document.getElementById("site-dropdown");
        let input = document.getElementById("site-name");

        if (!dropdown.contains(event.target) && event.target !== input) {
            dropdown.classList.remove("visible");
        }
    });

    // Attach click listeners to each question card
    let cards = document.querySelectorAll(".question-card");
    for (let card of cards) {
        card.addEventListener("click", function () {
            let i = parseInt(card.dataset.index);

            if (!selected[i] && selectedCount < 3) {
                selected[i] = true;
                selectedCount++;
                card.classList.add("selected");
            } else if (selected[i]) {
                selected[i] = false;
                selectedCount--;
                card.classList.remove("selected");
            } else {
                document.getElementById("limit-popup").classList.add("visible");
                setTimeout(function () {
                    document.getElementById("limit-popup").classList.remove("visible");
                }, 2000);
            }

            if (selectedCount === 3) {
                document.getElementById("generate-btn").disabled = false;
            } else {
                document.getElementById("generate-btn").disabled = true;
            }
        });
    }

    // Navigation: Questions -> Answers (build the 3 selected question+input blocks)
    document.getElementById("generate-btn").addEventListener("click", function () {
        let answerResult = "";
        for (let i = 0; i < questions.length; i++) {
            if (selected[i] === true) {
                answerResult += "<div class='answer-block'><p>" + questions[i] + "</p><input type='text' data-qindex='" + i + "'></div>";
            }
        }
        document.getElementById("answers-container").innerHTML = answerResult;

        document.getElementById("questions").classList.remove("active");
        document.getElementById("answers").classList.add("active");
    });

    // Reusable function: builds a fresh password from the current site name + typed answers
    function generatePassword() {
        let siteName = document.getElementById("site-name").value;

        let collectedAnswers = [];
        let answers = document.getElementById("answers-container").querySelectorAll("input");
        for (let input of answers) {
            collectedAnswers.push(input.value.trim());
        }

        let randomWordIndex = Math.floor(Math.random() * wordList.length);
        let randomWord = wordList[randomWordIndex];

        let randomNumber = Math.floor(Math.random() * 90) + 10;

        let components = [...collectedAnswers];
        components.push(randomWord);
        components.push(randomNumber);

        // Fisher-Yates shuffle: randomize the order of all components
        for (let i = components.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = components[i];
            components[i] = components[j];
            components[j] = temp;
        }

        // Pick one random capitalization rule
        let capRules = ["first", "middle", "last"];
        let randomRuleIndex = Math.floor(Math.random() * capRules.length);
        let chosenRule = capRules[randomRuleIndex];

        // Apply the chosen rule consistently to every word-type component
        for (let i = 0; i < components.length; i++) {
            if (typeof components[i] === "string") {
                let word = components[i];
                if (chosenRule === "first") {
                    word = word[0].toUpperCase() + word.slice(1);
                } else if (chosenRule === "last") {
                    word = word.slice(0, word.length - 1) + word[word.length - 1].toUpperCase();
                } else {
                    let midIndex = Math.floor((word.length - 1) / 2);
                    word = word.slice(0, midIndex) + word[midIndex].toUpperCase() + word.slice(midIndex + 1);
                }
                components[i] = word;
            }
        }

        // Pick one random symbol to use as the separator between components
        let symbols = ["-", "_", "!", "@", "+"];
        let randomSymbolIndex = Math.floor(Math.random() * symbols.length);
        let randomSymbol = symbols[randomSymbolIndex];

        // Join everything into the final password
        finalPassword = components.join(randomSymbol);

        // Display the result
        document.getElementById("password-output").innerHTML = finalPassword;
        document.getElementById("result-site").innerHTML = siteName;
    }

    // Navigation: Answers -> Result
    document.getElementById("proceed-btn").addEventListener("click", function () {
        let hasEmpty = false;
        let answers = document.getElementById("answers-container").querySelectorAll("input");
        for (let input of answers) {
            if (input.value.trim() === "") {
                hasEmpty = true;
            }
        }

        if (hasEmpty) {
            document.getElementById("empty-warning-popup").classList.add("visible");
            setTimeout(function () {
                document.getElementById("empty-warning-popup").classList.remove("visible");
            }, 2000);
            return;
        }

        generatePassword();
        document.getElementById("answers").classList.remove("active");
        document.getElementById("result").classList.add("active");
    });

    // Regenerate: build a new combination without leaving the Result page
    document.getElementById("regenerate-btn").addEventListener("click", function () {
        generatePassword();
    });

    // Copy password to clipboard
    document.getElementById("copy-btn").addEventListener("click", function () {
        navigator.clipboard.writeText(finalPassword);
        document.getElementById("copy-popup").classList.add("visible");

        setTimeout(function () {
            document.getElementById("copy-popup").classList.remove("visible");
        }, 2000);
    });

    // Restart: reset everything and go back to Landing
    document.getElementById("restart-btn").addEventListener("click", function () {
        selected = [false, false, false, false, false, false, false, false];
        selectedCount = 0;

        for (let card of cards) {
            card.classList.remove("selected");
        }

        document.getElementById("generate-btn").disabled = true;
        document.getElementById("site-name").value = "";

        document.getElementById("result").classList.remove("active");
        document.getElementById("landing").classList.add("active");
    });

});