let selectedRating = 0;

function sendMessage() {
  const chatBox = document.getElementById("chatBox");
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value.trim();
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  if (username === "" || message === "") {
    alert("Please enter your name and message");
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.innerHTML = `<strong>${role} (${username}):</strong> ${message}`;

  chatBox.appendChild(messageDiv);
  messageInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ⭐ STAR RATING */
function rate(stars) {
  selectedRating = stars;
  const allStars = document.querySelectorAll(".stars");

  allStars.forEach((star, index) => {
    star.style.color = index < stars ? "gold" : "gray";
  });
}

/* 📝 REVIEW */
function submitReview() {
  const reviewText = document.getElementById("reviewText").value.trim();
  const reviewDisplay = document.getElementById("reviewDisplay");

  if (selectedRating === 0 || reviewText === "") {
    alert("Please rate and write a review");
    return;
  }

  const reviewDiv = document.createElement("div");
  reviewDiv.innerHTML = `
    <p>⭐ Rating: ${selectedRating}/5</p>
    <p>${reviewText}</p>
    <hr>
  `;

  reviewDisplay.appendChild(reviewDiv);
  document.getElementById("reviewText").value = "";
  selectedRating = 0;

  document.querySelectorAll(".stars").forEach(star => {
    star.style.color = "gray";
  });
}

