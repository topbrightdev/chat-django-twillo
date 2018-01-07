$(function() {
  // Get handle to the chat div
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

  // Alert the user they have been assigned a username
  print("Logging in...");

  // Get an access token for the current user, passing a username (identity)
  // and a device ID - for browser-based apps, we'll always just use the
  // value "browser"
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
      chatClient = new Twilio.Chat.Client(data.token);
      chatClient.getSubscribedChannels().then(createOrJoinChannel);
    }
  );

  function createOrJoinChannel() {
    // Get the room's chat channel
    let channelName = $("main")
      .data("pageName")
      .toLowerCase();
    if (!channelName) {
      console.log("Channel name not found!!!");
      return;
    }
    print(`Attempting to join "${channelName}" chat channel...`);
    let promise = chatClient.getChannelByUniqueName(channelName);
    promise
      .then(function(channel) {
        roomChannel = channel;
        console.log("Found channel:", channelName);
        setupChannel(channelName);
      })
      .catch(function() {
        // If it doesn't exist, let's create it
        console.log(`Creating ${channelName} channel`);
        chatClient
          .createChannel({
            uniqueName: channelName,
            friendlyName: `${channelName} Chat Channel`
          })
          .then(function(channel) {
            console.log("Created channel:", channel);
            roomChannel = channel;
            setupChannel(channelName);
          });
      });
  }

  function processPage(page) {
    page.items.forEach(message => {
      printMessage(message.author, message.body);
    });
    if (page.hasNextPage) {
      console.log("Has next page");
      page.nextPage().then(processPage);
    } else {
      console.log("Done loading messages");
    }
  }

  // Set up channel after it has been found
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

  // Send a new message to the channel
  let $form = $("#message-form");
  let $input = $("#message-input");
  $form.on("submit", function(e) {
    e.preventDefault();
    if (roomChannel) {
      roomChannel.sendMessage($input.val());
      $input.val("");
    }
  });
});
