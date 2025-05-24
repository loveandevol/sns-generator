let comments = [];

document.getElementsByName("like").forEach(radio => {
  radio.addEventListener("change", () => {
    document.getElementById("likeNamesLabel").style.display = document.getElementById("likeYes").checked ? "block" : "none";
  });
});

function toggleImageInput() {
  const useUrl = document.querySelector('input[name="imageType"]:checked').value === 'url';
  document.getElementById("urlInputArea").style.display = useUrl ? "block" : "none";
  document.getElementById("fileInputArea").style.display = useUrl ? "none" : "block";
}

function toggleIconInput() {
  const useUrl = document.querySelector('input[name="iconType"]:checked').value === 'url';
  document.getElementById("iconUrlInputArea").style.display = useUrl ? "block" : "none";
  document.getElementById("iconFileInputArea").style.display = useUrl ? "none" : "block";
}

function addComment() {
  const name = document.getElementById("commentName").value.trim();
  const content = document.getElementById("commentText").value.trim();
  if (name && content) {
    comments.push({ type: "comment", name, content });
    document.getElementById("commentName").value = "";
    document.getElementById("commentText").value = "";
  }
}

function addReply() {
  const name = document.getElementById("replyName").value.trim();
  const to = document.getElementById("replyTo").value.trim();
  const content = document.getElementById("replyText").value.trim();
  if (name && to && content) {
    comments.push({ type: "reply", name, to, content });
    document.getElementById("replyName").value = "";
    document.getElementById("replyTo").value = "";
    document.getElementById("replyText").value = "";
  }
}

function generateCard() {
  const iconType = document.querySelector('input[name="iconType"]:checked').value;
  if (iconType === "url") {
    const icon = document.getElementById("iconUrl").value.trim();
    handleContentImage(icon);
  } else {
    const file = document.getElementById("iconFile").files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        handleContentImage(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      handleContentImage("");
    }
  }
}

function handleContentImage(icon) {
  const name = document.getElementById("userName").value.trim();
  const content = document.getElementById("mainContent").value.trim();
  const like = document.getElementById("likeYes").checked;
  const likeNames = document.getElementById("likeNames").value.trim();
  const useUrl = document.querySelector('input[name="imageType"]:checked').value === 'url';

  if (useUrl) {
    const contentImg = document.getElementById("contentImageUrl").value.trim();
    renderCard(icon, name, content, contentImg, like, likeNames);
  } else {
    const file = document.getElementById("contentImageFile").files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        renderCard(icon, name, content, e.target.result, like, likeNames);
      };
      reader.readAsDataURL(file);
    } else {
      renderCard(icon, name, content, "", like, likeNames);
    }
  }
}

function renderCard(icon, name, content, contentImg, like, likeNames) {
  let html = `<div class="lnd-sns">
    <div class="lnd-left"><div class="lnd-sns-icon" style="background-image: url('${icon}')"></div></div>
    <div class="lnd-right">
      <div class="lnd-sns-name">${name}</div>
      <div class="lnd-sns-content">${content}`;

  if (contentImg) {
    html += `<br><img src="${contentImg}" alt="content image">`;
  }

  html += `</div><div class="lnd-sns-comment">`;

  if (like && likeNames) {
    html += `<div class="lnd-sns-like"><span class="commenter">${likeNames}</span></div>`;
  }

  comments.forEach(item => {
    if (item.type === "comment") {
      html += `<p><span class="commenter">${item.name}</span>: ${item.content}</p>`;
    } else if (item.type === "reply") {
      html += `<p><span class="commenter">${item.name}</span> to <span class="commenter">${item.to}</span>: ${item.content}</p>`;
    }
  });

  html += `</div></div></div>`;

  document.getElementById("preview").innerHTML = html;
  document.getElementById("outputCode").value = html;
}

function copyCode() {
  const code = document.getElementById("outputCode");
  code.select();
  code.setSelectionRange(0, 99999);
  document.execCommand("copy");
}

function savePreviewAsImage() {
  const preview = document.getElementById("preview");
  html2canvas(preview, {
    scale: 3,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "sns_card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}
