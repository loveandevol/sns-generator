let comments = [];

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 라디오 버튼 이벤트 리스너
  document.getElementsByName("like").forEach(radio => {
    radio.addEventListener("change", () => {
      document.getElementById("likeNamesLabel").style.display = 
        document.getElementById("likeYes").checked ? "block" : "none";
      updatePreview(); // 실시간 업데이트 추가
    });
  });

  // 이미지 타입 변경시에도 실시간 업데이트
  document.getElementsByName("imageType").forEach(radio => {
    radio.addEventListener("change", updatePreview);
  });

  document.getElementsByName("iconType").forEach(radio => {
    radio.addEventListener("change", updatePreview);
  });

  // 입력 필드 변경시 실시간 업데이트
  ['userName', 'mainContent', 'iconUrl', 'contentImageUrl', 'likeNames'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updatePreview);
    }
  });

  // 파일 입력 변경시 실시간 업데이트
  ['iconFile', 'contentImageFile'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', updatePreview);
    }
  });
});

function toggleImageInput() {
  const useUrl = document.querySelector('input[name="imageType"]:checked').value === 'url';
  document.getElementById("urlInputArea").style.display = useUrl ? "block" : "none";
  document.getElementById("fileInputArea").style.display = useUrl ? "none" : "block";
  updatePreview(); // 토글시에도 업데이트
}

function toggleIconInput() {
  const useUrl = document.querySelector('input[name="iconType"]:checked').value === 'url';
  document.getElementById("iconUrlInputArea").style.display = useUrl ? "block" : "none";
  document.getElementById("iconFileInputArea").style.display = useUrl ? "none" : "block";
  updatePreview(); // 토글시에도 업데이트
}

function addComment() {
  const name = document.getElementById("commentName").value.trim();
  const content = document.getElementById("commentText").value.trim();
  
  if (!name || !content) {
    alert("댓글 작성자와 내용을 모두 입력해주세요.");
    return;
  }
  
  comments.push({ type: "comment", name, content });
  document.getElementById("commentName").value = "";
  document.getElementById("commentText").value = "";
  
  // 댓글 추가 후 즉시 미리보기 업데이트
  updatePreview();
  
  console.log("댓글 추가됨:", { name, content });
}

function addReply() {
  const name = document.getElementById("replyName").value.trim();
  const to = document.getElementById("replyTo").value.trim();
  const content = document.getElementById("replyText").value.trim();
  
  if (!name || !to || !content) {
    alert("답글 작성자, 대상자, 내용을 모두 입력해주세요.");
    return;
  }
  
  comments.push({ type: "reply", name, to, content });
  document.getElementById("replyName").value = "";
  document.getElementById("replyTo").value = "";
  document.getElementById("replyText").value = "";
  
  // 답글 추가 후 즉시 미리보기 업데이트
  updatePreview();
  
  console.log("답글 추가됨:", { name, to, content });
}

// 댓글 삭제 기능 추가
function clearAllComments() {
  if (comments.length === 0) {
    alert("삭제할 댓글이 없습니다.");
    return;
  }
  
  if (confirm("모든 댓글과 답글을 삭제하시겠습니까?")) {
    comments = [];
    updatePreview();
    console.log("모든 댓글 삭제됨");
  }
}

// 통합된 미리보기 업데이트 함수
function updatePreview() {
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

// 기존 generateCard 함수는 updatePreview의 별칭으로
function generateCard() {
  updatePreview();
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
  // 빈 내용일 때 기본값 설정
  const displayName = name || "사용자명";
  const displayContent = content || "내용을 입력해주세요";
  
  let html = `<div class="lnd-sns">
    <div class="lnd-left"><div class="lnd-sns-icon" style="background-image: url('${icon}')"></div></div>
    <div class="lnd-right">
      <div class="lnd-sns-name">${displayName}</div>
      <div class="lnd-sns-content">${displayContent}`;

  if (contentImg) {
    html += `<br><img src="${contentImg}" alt="content image">`;
  }

  html += `</div><div class="lnd-sns-comment">`;

  if (like && likeNames) {
    html += `<div class="lnd-sns-like"><span class="commenter">${likeNames}</span></div>`;
  }

  // 댓글 렌더링
  comments.forEach((item, index) => {
    if (item.type === "comment") {
      html += `<p><span class="commenter">${item.name}</span>: ${item.content}</p>`;
    } else if (item.type === "reply") {
      html += `<p><span class="commenter">${item.name}</span> to <span class="commenter">${item.to}</span>: ${item.content}</p>`;
    }
  });

  html += `</div></div></div>`;

  document.getElementById("preview").innerHTML = html;
  document.getElementById("outputCode").value = html;
  
  // 현재 댓글 상태 표시
  console.log(`현재 댓글 수: ${comments.length}`);
}

function copyCode() {
  const code = document.getElementById("outputCode");
  code.select();
  code.setSelectionRange(0, 99999);
  
  try {
    document.execCommand("copy");
    alert("코드가 복사되었습니다!");
  } catch (err) {
    alert("복사 실패. 수동으로 복사해주세요.");
  }
}

function savePreviewAsImage() {
  const preview = document.getElementById("preview");
  
  if (!preview.innerHTML.trim()) {
    alert("먼저 카드를 생성해주세요.");
    return;
  }
  
  html2canvas(preview, {
    scale: 3,
    useCORS: true,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "sns_card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }).catch(err => {
    console.error('이미지 저장 실패:', err);
    alert("이미지 저장에 실패했습니다.");
  });
}
