/*
 * Copyright (c) AWS France
 *
*/

const ConversationContext = require('node-nlp');
var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-1'});

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


/**
 * DynamoDB conversation context manager.
 */
class DynamoConversationContext extends ConversationContext {
  /**
   * Constructor of the class.
   * @param {Object} settings Settings for the instance.
   */
  constructor(settings) {
    super(settings);
    this.conversationContexts = {};
  }

  /**
   * Gets the conversation context from the session.
   * @param {Object} session Chatbot session of the conversation.
   * @returns {Promise<Object>} Promise to resolve the conversation context.
   */
  getConversationContext(session) {
    return new Promise((resolve, reject) => {
      const conversationId = this.getConversationId(session);
      if (!conversationId) {
        return reject(new Error('No conversation id found'));
      }
      var context = {};
      
      var params = {
        TableName: 'Conversations',
        Key: {
          'Conversation_ID': {S: conversationId}
        },
        ProjectionExpression: 'ATTRIBUTE_NAME'
      };

      // Call DynamoDB to read the item from the table
      ddb.getItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
          
        } else {
          context = data.item;
          console.log("Success", context);
        }
      });
      return resolve(context);
    });
  }

  setConversationContext(session, context) {
    return new Promise((resolve, reject) => {
      const conversationId = this.getConversationId(session);
      if (!conversationId) {
        return reject(new Error('No conversation id found'));
      }
      var params = {
        TableName: 'Conversations',
        Item: {
          'Conversation_ID' : {S: conversationId},
          'Context' : {S: context}
        }
      };
      // Call DynamoDB to add the item to the table
      ddb.putItem(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data);
        }
      });
      return resolve();
    });
  }
}

module.exports = DynamoConversationContext;
