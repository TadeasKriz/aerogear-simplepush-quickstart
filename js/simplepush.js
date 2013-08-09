(function() {
    var mailEndpoint, mailRequest, SPClient, UPClient;

    var variantId = ""; // put simplepush variantId here
    var variantSecret = ""; // put simplepush variantSecret here
    var registryUrl = "http://localhost:8080/ag-push/rest/registry/device";

    var UPClient = AeroGear.UnifiedPushClient(variantId, variantSecret, registryUrl);

    // onConnect callback function:
    function spConnect() {
        getTextAreaElement().value = "Connection established!";

        // use 'PushManager' to request a new PushServer URL endpoint for 'mail' notifications:
        mailRequest = navigator.push.register();

        // the DOMRequest returns 'successfully':
        mailRequest.onsuccess = function( event ) {
            // extract the endpoint object from the event: 
            mailEndpoint = event.target.result;
            
            var metadata = {
                deviceToken: mailEndpoint.channelID,
                alias: "some-alias", // for example user's email
                category: "broadcast"
            };

            UPClient.registerWithPushServer(metadata);

            // store the channelID...
            appendTextArea("Subscribed to Mail messages on " + mailEndpoint.channelID);
        };

        // set the notification handler:
        navigator.setMessageHandler( "push", function( message ) {
            // we got message for our 'mail' endpoint ? 
            if ( message.channelID === mailEndpoint.channelID ) {
                // let's react on that mail....
                appendTextArea("Mail Notification - " + message.version);
            }
        });
    }

    function appendTextArea(newData) {
        var el = getTextAreaElement();
        el.value = el.value + '\n' + newData;
    }

    function getTextAreaElement() {
        return document.getElementById('responseText');
    }

    // custom.....
    $("#reconnect").on("click", function(event) {
        // AeroGear add-on to allow a reconnect, if the WebSocket/SockJS connection is lost
            navigator.push.reconnect();
        });
        
    // onClose callback function:
    function spClose() {
        $("#reconnect").show();
        // TODO should we really unregister when disconnected?
        UPClient.unregisterWithPushServer(mailEndpoint.channelID);
        appendTextArea("\nConnection Lost!\n");
    }

    SPClient = AeroGear.SimplePushClient({
        simplePushServerURL: "http://localhost:7777/simplepush",
        onConnect: spConnect,
        onClose: spClose
    });
})();
