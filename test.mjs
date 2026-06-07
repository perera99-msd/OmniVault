import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/omnivault_dev');
  const db = mongoose.connection.db;
  
  const users = await db.collection('users').find().toArray();
  console.log('Users:', users.length);
  
  const wallets = await db.collection('wallets').find().toArray();
  console.log('Wallets:', wallets.map(w => ({ id: w._id, userId: w.userId, name: w.name })));

  const txs = await db.collection('transactions').find().toArray();
  console.log('Transactions:', txs.map(t => ({ id: t._id, userId: t.userId, amount: t.amount })));

  process.exit(0);
}

run().catch(console.error);
