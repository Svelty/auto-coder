exports.up = function(knex) {
  return knex.schema.createTable('messages', function(table) {
    table.increments('id').primary();                   // Primary key
    table.string('role').notNullable();                // 'user', 'assistant', 'system', etc.
    table.text('content').notNullable();               // Message body
    table.integer('sessionId').notNullable();          // Session reference
    table.string('message_type').notNullable();        // Type of message (text, function_call, image, etc.)
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());    // Created timestamp
    table.timestamp('updated_at').nullable();          // Last edited timestamp (optional)
    table.json('metadata').nullable();                 // Any extensible, structured data
    // If sessions or users table exist, you can add foreign keys here, e.g.:
    // table.foreign('sessionId').references('id').inTable('sessions').onDelete('CASCADE');
    // table.integer('sender_id').unsigned().references('id').inTable('users');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages');
};
