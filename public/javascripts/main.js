(function() {
  /**
   * 초기화
   */
  $('#chat').hide();
  refreshChatroomList();
  
  /**
   * 파일 업로드하기
   */
  $('#uploadButton').click(event => {
    const formData = new FormData($('#uploadForm')[0]);
    
    $.ajax({
      url: '/files',
      method: 'POST',
      enctype: 'multipart/form-data',
      data: formData,
      processData: false,
      contentType: false,
      cache: false,
      success: function(data) {
        console.log(data);
        $('#uploadForm')[0].reset();
        alert('upload complete');
      },
      error: function(res) {
        $('#uploadForm')[0].reset();
        switch (res.status) {
        case 500:
          alert(res.responseText);
          break;
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(res.responseText);
          break;
        }
      }
    });

    event.preventDefault();
    return false;
  });

  /**
   * 파일 실행하기
   */
  $('#excuteButton').click(function() {
    var currentFile = $('#currentFile').text();
    $.ajax('/files/exec?path=' + currentFile, {
      success: function(data) {
        $('#terminal').text(data);
      },
      error: function(res) {
        switch (res.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(res.responseText);
          break;
        }
      },
   });
  });

  /**
   * 파일 읽기
   */
  $('.files').click(onClickFiles);
    
  function onClickFiles (event) {
    const path = $(this).text();
    $('#currentFile').text(path);

    $.ajax('/files?path=' + path, {
      success: function(data) {
        editor.setValue(data);
      },
      error: function(res) {
        switch (res.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(res.responseText);
          break;
        }
      },
    });
    event.preventDefault();
    return false;
  }

  /**
   * 파일 저장하기
   */
  $('#saveButton').click(event => {
    const path = $('#currentFile').text();
    const data = editor.getValue();
    $.ajax({
      type: 'put',
      url: '/files',
      contentType: 'application/json',
      data: JSON.stringify({
        path,
        data,
      }),
      success: function(data){
        alert('Saved successfully');
      },
      error: function(res) {
        switch (res.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(res.responseText);
          break;
        }
      },
    });
    event.preventDefault();
    return false;
  });

  /**
   * 테스트 케이스 실행
   */
  $('#testButton').click(event => {
    const path = $('#currentFile').text();
    const testInput = $('#testInput').val();
    const testOutput = $('#testOutput').val();
    const url = `/files/test?path=${path}&input=${testInput}&output=${testOutput}`;

    $.ajax({
      url,
      type: 'get',
      success: function(data) {
        $('#terminal').text(data);
      },
      error: function(res) {
        switch (res.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(res.responseText);
          break;
        }
      },
    });
    event.preventDefault();
    return false;
  });

  /**
   * 방 목록 갱신하기
   */
  $('#refreshFileButton').click(function (event) {
    $.ajax({
      url: '/files/list',
      type: 'get',
      success: function(data) {
        const fileList = $('#fileList');
        fileList.empty();
        for (let d of data) {
          fileList.append(`<li><a href="" class="files">${d}</a></li>`);
        }
        // click callback 다시 붙여주기
        $('.files').click(onClickFiles);
      },
      error: function(res) {
        switch (res.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(res.responseText);
          break;
        }
      }
    });
    event.preventDefault();
    return false;
  });


  /**
   * 소켓 연결
   */
  const socket = io.connect('http://localhost:3000');

  /**
   * 채팅 보내기
   */
  $('#msgbox').keyup(function (event) {
    if (event.which == 13) {
      const msg = $(this).val();
      console.log(msg);
      if (msg === '') return;
      socket.emit('fromclient', { msg });
      $(this).val('');
    }
  });

  /**
   * 채팅 받기
   */
  socket.on('broadcast', function (data) {
    const textbox = $('#msgs');
    textbox.append(`<p>${data.msg}</p>`);
    // scroll to bottom
    textbox.animate({ scrollTop: textbox.prop('scrollHeight')}, 0);
  });

  /**
   * 채팅 방 만들기
   */
  $('#createRoomButton').click(function () {
    console.log('create room button clicked');
  });

  /**
   * 채팅 방 읽기
   */
  $('.chatrooms').click(readChatroom);

  function readChatroom (event) {
    event.preventDefault();

    console.log('list of chatrooms clicked');
    const url = `/chats/${$(this).text()}`;
    $.ajax(url, {
      success: function (data) {
        console.log(data);
        $('#roomName').text(data.name);
        fillMessages(data.messages);
        // scroll to bottom
        $('#msgs').animate({ scrollTop: $('#msgs').prop('scrollHeight')}, 0);
      },
      error: function (err) {
        switch (err.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(err.responseText);
          break;
        }
      }
    });
  }

  function fillMessages(messages) {
    const textbox = $('#msgs');
    textbox.empty();
    for (let m of messages) {
      textbox.append(`<p>${m}</p>`);
    }
  }

  /**
   * 채팅 방 목록 갱신하기
   */
  $('#refreshChatroomButton').click(refreshChatroomList);

  function refreshChatroomList () {
    const url = '/users/chatrooms';
    $.ajax(url, {
      success: function (data) {
        console.log(data);
        const chatroomList = $('#chatroomList');
        chatroomList.empty();
        for (let d of data) {
          chatroomList.append(`<li><a href="" class="chatrooms">${d}</a></li>`);
        }
        $('.chatrooms').click(readChatroom);
      },
      error: function(err) {
        console.log(err);
        switch (err.status) {
        case 401:
          alert('세션이 만료되었습니다. ');
          $(location).attr('href', '/');
          break;
        default:
          alert(err.responseText);
          break;
        }
      },
    });
  }
  
  /**
   * 내비게이션 바 - 채팅
   */
  $('#chatNav').click(() => {
    $('#editNav').removeClass('active');
    $('#edit').hide();
    $('#chatNav').addClass('active');
    $('#chat').show();
    return false;
  });

  /**
   * 내비게이션 바 - 에디터
   */
  $('#editNav').click(function (event) {
    $('#chatNav').removeClass('active');
    $('#chat').hide();
    $('#editNav').addClass('active');
    $('#edit').show();
    return false;
  });
})();
