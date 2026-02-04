let comments = [];
let cropper = null;
let currentCropType = ''; // 'icon' 또는 'content'
let originalImageData = {}; // 원본 이미지 데이터 저장

// 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 라디오 버튼 이벤트 리스너
  document.getElementsByName("like").forEach(radio => {
    radio.addEventListener("change", () => {
      document.getElementById("likeNamesLabel").style.display = 
        document.getElementById("likeYes").checked ? "block" : "none";
      updatePreview();
    });
  });

  // 입력 필드 변경시 실시간 업데이트
  ['userName', 'mainContent', 'iconUrl', 'contentImageUrl', 'likeNames'].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updatePreview);
    }
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

// 아이콘 파일 변경 처리
function handleIconFileChange(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      originalImageData.icon = e.target.result;
      document.getElementById('iconEditBtn').style.display = 'inline-block';
      updatePreview();
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('iconEditBtn').style.display = 'none';
    delete originalImageData.icon;
  }
}

// 컨텐츠 파일 변경 처리
function handleContentFileChange(input) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      originalImageData.content = e.target.result;
      document.getElementById('contentEditBtn').style.display = 'inline-block';
      updatePreview();
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('contentEditBtn').style.display = 'none';
    delete originalImageData.content;
  }
}

// 크롭 모달 열기
function openCropModal(type) {
  currentCropType = type;
  const imageData = originalImageData[type];
  
  if (!imageData) {
    alert('이미지를 먼저 선택해주세요.');
    return;
  }
  
  const cropImage = document.getElementById('cropImage');
  cropImage.src = imageData;
  
  document.getElementById('cropModal').style.display = 'block';
  
  // 이미지가 로드된 후 cropper 초기화
  cropImage.onload = function() {
    // 기존 cropper 제거
    if (cropper) {
      cropper.destroy();
    }
    
    // 타입에 따른 cropper 옵션 설정
    const aspectRatio = type === 'icon' ? 1 : NaN; // 프로필은 1:1, 컨텐츠는 자유
    
    cropper = new Cropper(cropImage, {
      aspectRatio: aspectRatio,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      responsive: true,
      restore: false,
      checkOrientation: false,
      modal: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
    });
  };
}

// 크롭 모달 닫기
function closeCropModal() {
  document.getElementById('cropModal').style.display = 'none';
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
}

// 크롭 적용
function applyCrop() {
  if (!cropper) {
    alert('크롭 도구가 초기화되지 않았습니다.');
    return;
  }
  
  // 크롭된 이미지를 캔버스로 가져오기
  const canvas = cropper.getCroppedCanvas({
    maxWidth: 800,
    maxHeight: 600,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });
  
  if (canvas) {
    const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // 크롭된 이미지를 해당 타입에 저장
    if (currentCropType === 'icon') {
      originalImageData.iconCropped = croppedImageData;
    } else if (currentCropType === 'content') {
      originalImageData.contentCropped = croppedImageData;
    }
    
    // 미리보기 업데이트
    updatePreview();
    
    // 모달 닫기
    closeCropModal();
  } else {
    alert('이미지 처리 중 오류가 발생했습니다.');
  }
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
  
  updatePreview();
  console.log("답글 추가됨:", { name, to, content });
}

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

function updatePreview() {
  const name = document.getElementById("userName").value.trim();
  const content = document.getElementById("mainContent").value.trim();
  
  if (!name && !content) {
    document.getElementById("preview").innerHTML = "";
    document.getElementById("outputCode").value = "";
    return;
  }
  
  const iconType = document.querySelector('input[name="iconType"]:checked').value;
  
  if (iconType === "url") {
    const icon = document.getElementById("iconUrl").value.trim();
    handleContentImage(icon);
  } else {
    // 크롭된 이미지가 있으면 사용, 없으면 원본 사용
    const iconData = originalImageData.iconCropped || originalImageData.icon || "";
    handleContentImage(iconData);
  }
}

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
    // 크롭된 이미지가 있으면 사용, 없으면 원본 사용
    const contentImg = originalImageData.contentCropped || originalImageData.content || "";
    renderCard(icon, name, content, contentImg, like, likeNames);
  }
}

function renderCard(icon, name, content, contentImg, like, likeNames) {
  if (!name && !content) {
    return;
  }
  
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

  html += `</div>`; // .lnd-sns-content 닫는 태그

  // ▼▼▼▼▼ 여기부터 수정 ▼▼▼▼▼
  // 좋아요(이름 포함) 또는 댓글이 하나라도 있을 경우에만 lnd-sns-comment 컨테이너를 생성합니다.
  const hasInteraction = (like && likeNames) || comments.length > 0;

  if (hasInteraction) {
    html += `<div class="lnd-sns-comment">`;

    if (like && likeNames) {
      html += `<div class="lnd-sns-like"><span class="commenter">${likeNames}</span></div>`;
    }
  
    comments.forEach((item, index) => {
      if (item.type === "comment") {
        html += `<p><span class="commenter">${item.name}</span>: ${item.content}</p>`;
      } else if (item.type === "reply") {
        html += `<p><span class="commenter">${item.name}</span> to <span class="commenter">${item.to}</span>: ${item.content}</p>`;
      }
    });
  
    html += `</div>`; // .lnd-sns-comment 닫는 태그
  }

  html += `</div></div>`; // .lnd-right와 .lnd-sns 닫는 태그

  document.getElementById("preview").innerHTML = html;
  document.getElementById("outputCode").value = html;
  
  console.log(`현재 댓글 수: ${comments.length}`);
}
function copyCode() {
  const code = document.getElementById("outputCode");
  const textToCopy = code.value; // 화면 선택이 아닌 값 자체를 가져옵니다.

  // 1. 최신 방식 (Clipboard API) - 데이터 자체를 복사하므로 잘리지 않음
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert("코드가 복사되었습니다!");
      })
      .catch(err => {
        // 권한 문제 등으로 실패할 경우 기존 방식으로 시도
        console.error("Clipboard API 실패, 기존 방식으로 시도합니다.", err);
        fallbackCopy(code);
      });
  } else {
    // 2. 구형 브라우저 등을 위한 예비 방식
    fallbackCopy(code);
  }
}

// 예비용 복사 함수 (기존 방식 개선)
function fallbackCopy(element) {
  element.select();
  element.setSelectionRange(0, 999999); // 모바일 등에서 선택 범위 확장
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

// 모달 외부 클릭시 닫기
document.addEventListener('click', function(e) {
  const modal = document.getElementById('cropModal');
  if (e.target === modal) {
    closeCropModal();
  }
});

// HTML 요소들을 가져옵니다.
const helpToggleButton = document.getElementById('help-toggle-button');
const helpPanel = document.getElementById('help-panel');
const helpCloseButton = document.getElementById('help-close-button');

// 패널의 열림/닫힘 상태에 따라 버튼 내용을 변경하는 함수
function updateButtonContent() {
    // 3번 요청: 패널이 열려있는지(.active 클래스 확인) 확인
    if (helpPanel.classList.contains('active')) {
        // 열려있을 때
        helpToggleButton.innerHTML = '닫기<i class="fa-solid fa-angles-right"></i>';
    } else {
        // 닫혀있을 때
        helpToggleButton.innerHTML = '<i class="fa-solid fa-angles-left"></i>도움말';
    }
}

// 오른쪽 상단 버튼 클릭 시
helpToggleButton.addEventListener('click', () => {
    helpPanel.classList.toggle('active');
    updateButtonContent(); // 버튼 내용 업데이트 함수 호출
});

// 패널 안의 닫기 버튼 클릭 시
helpCloseButton.addEventListener('click', () => {
    helpPanel.classList.remove('active');
    updateButtonContent(); // 버튼 내용 업데이트 함수 호출
});

// 패널 바깥 영역 클릭 시
document.addEventListener('click', (event) => {
    if (!helpPanel.contains(event.target) && !helpToggleButton.contains(event.target)) {
        if (helpPanel.classList.contains('active')) {
            helpPanel.classList.remove('active');
            updateButtonContent(); // 버튼 내용 업데이트 함수 호출
        }
    }
});


