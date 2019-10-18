const pubsub = new PubSub();
export const resolvers = {addMessage: (root, { message }) => {
  const channel = channels.find(channel => channel.id ===
message.channelId);
  if(!channel)
    throw new Error("Channel does not exist");
    
  const newMessage = { id: String(nextMessageId++), text: message.text };
  channel.messages.push(newMessage);
  pubsub.publish("messageAdded", { messageAdded: newMessage, channelId: message.channelId });
  return newMessage;
}}