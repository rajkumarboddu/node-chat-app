var socket = io();

socket.on('connect', function() {
	console.log('Conntected...');
});

const params = $.deparam.querystring();

socket.emit('join', params, function(err) {
	if(err) {
		alert(err);
		window.location.href = '/';
	}
	$('#room-name').html(params.roomName);
});

socket.on('usersUpdated', function(user_names) {
	$('#user-list').html('');
	user_names.forEach(function(user) {
		$('#user-list').append(`<div class="my-1 p-2 bg-light">${user}</div>`);
	});
});

socket.on('newMessage', function(message) {
	var template = $('#message-template').html();
	Mustache.parse(template);
	var html = Mustache.render(template, message);
	$("#messages").append(html);
	scrollDown();
});

socket.on('newLocationShareMessage', function(message) {
	var template = $('#message-location-template').html();
	Mustache.parse(template);
	var html = Mustache.render(template, message);
	$("#messages").append(html);
	scrollDown();
});

socket.on('disconnect', function() {
	console.log('Disconnected...');
});

function scrollDown() {
	var messages = $('#messages');
	var scrollHeight = $('#messages').prop('scrollHeight');
	var clientHeight = $('#messages').prop('clientHeight');
	var scrollTop = $('#messages').prop('scrollTop');
	var lastMsgHeight = $('#messages > div:last-child').height();
	var last2MsgHeight = $('#messages > div:last-child').prev().height();
	if(scrollTop + clientHeight > scrollHeight-lastMsgHeight-last2MsgHeight) {
		messages.scrollTop(scrollHeight);
	}
}

$('#message-form').on('submit', function(e) {
	e.preventDefault();
	var message = $('#message').val().trim();
	if(message.length > 0) {
		scrollDown();
		socket.emit('newMessage', {
			message: message,
			created_at: new Date()
		}, function(err) {
			if(err) {
				alert(err);
				return;
			}
			$('#message').val('');
		});
	}
});

var shareLocationBtn = $('#share-location-btn');
shareLocationBtn.click(function(e) {
	e.preventDefault();
	if(!navigator.geolocation) {
		alert('Your browser does not support geolocation');
	}

	navigator.geolocation.getCurrentPosition(function(position) {
		shareLocationBtn.attr('disabled', 'disabled');
		socket.emit('newLocationShareMessage', {
			lat: position.coords.latitude,
			lng: position.coords.longitude,
			created_at: new Date()
		}, function(err) {
			if(err) {
				alert(err);
			}
			shareLocationBtn.removeAttr('disabled');
		});

	}, function(err) {
		alert('Unable to fetch location');
		shareLocationBtn.removeAttr('disabled');
	});
});