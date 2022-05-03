const schema = {
  properties: {
    body: {
      type: 'string',
      minLength: 1,
      pattern: '\=$' //ensures string ends with =
    },
  },
  required: ['body'],
};

export default schema;