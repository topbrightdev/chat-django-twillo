$(function() {
  // Reference to the chat messages area
  let $chatWindow = $("#messages");

  // Our interface to the Chat service
  let chatClient;

  // A handle to the room's chat channel
  let roomChannel;

  // The server will assign the client a random username - stored here
  let username;

  // Helper function to print info messages to the chat window
  function print(infoMessage, asHtml) {
    let $msg = $('<div class="info">');
    if (asHtml) {
      $msg.html(infoMessage);
    } else {
      $msg.text(infoMessage);
    }
    $chatWindow.append($msg);
  }

  // Helper function to print chat message to the chat window
  function printMessage(fromUser, message) {
    let $user = $('<span class="username">').text(fromUser + ":");
    if (fromUser === username) {
      $user.addClass("me");
    }
    let $message = $('<span class="message">').text(message);
    let $container = $('<div class="message-container">');
    $container.append($user).append($message);
    $chatWindow.append($container);
    $chatWindow.scrollTop($chatWindow[0].scrollHeight);
  }

  // Get an access token for the current user, passing a device ID
  // for browser-based apps, we'll just use the value "browser"
  $.getJSON(
    "/token",
    {
      device: "browser"
    },
    function(data) {
      // Alert the user they have been assigned a random username
      username = data.identity;
      print(
        "You have been assigned a random username of: " +
          '<span class="me">' +
          username +
          "</span>",
        true
      );

      // Initialize the Chat client
      // chatClient = new Twilio.Chat.Client(data.token);

      Twilio.Chat.Client.create(data.token).then(client => {
        // Use client
        chatClient = client;
        chatClient.getSubscribedChannels().then(createOrJoinChannel);
      });
    }
  );

  // Set up channel after it has been found / created
  function setupChannel(name) {
    roomChannel.join().then(function(channel) {
      print(
        `Joined channel ${name} as <span class="me"> ${username} </span>.`,
        true
      );
      channel.getMessages(30).then(processPage);
    });

    // Listen for new messages sent to the channel
    roomChannel.on("messageAdded", function(message) {
      printMessage(message.author, message.body);
    });
  }

  function processPage(page) {
    page.items.forEach(message => {
      printMessage(message.author, message.body);
    });
    if (page.hasNextPage) {
      page.nextPage().then(processPage);
    } else {
      console.log("Done loading messages");
    }
  }

  function createOrJoinChannel(channels) {
    // Extract the room's channel name from the page URL
    let channelName = window.location.pathname.split("/").slice(-2, -1)[0];

    print(`Attempting to join "${channelName}" chat channel...`);

    chatClient
      .getChannelByUniqueName(channelName)
      .then(function(channel) {
        roomChannel = channel;
        console.log("Found channel:", channelName);
        setupChannel(channelName);
      })
      .catch(function() {
        // If it doesn't exist, let's create it
        chatClient
          .createChannel({
            uniqueName: channelName,
            friendlyName: `${channelName} Chat Channel`
          })
          .then(function(channel) {
            roomChannel = channel;
            setupChannel(channelName);
          });
      });
  }

  // Add newly sent messages to the channel
  let $form = $("#message-form");
  let $input = $("#message-input");
  $form.on("submit", function(e) {
    e.preventDefault();
    if (roomChannel && $input.val().trim().length > 0) {
      roomChannel.sendMessage($input.val());
      $input.val("");
    }
  });
});
