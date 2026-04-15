/**
 * 古いTODO削除バッチ
 *
 * 完了済みかつ保持期間を超えたTODOを削除する。
 * デフォルトはdry-run。--force で実際に削除。
 *
 * 使い方:
 *   node src/batch/cleanup.js           # dry-run
 *   node src/batch/cleanup.js --force   # 実削除
 */

const { Todo, sequelize } = require('../models/Todo');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || '30', 10);
const LOCK_FILE = '.cleanup.lock';

const fs = require('fs');
const path = require('path');

async function acquireLock() {
  const lockPath = path.join(__dirname, '../../', LOCK_FILE);
  if (fs.existsSync(lockPath)) {
    throw new Error('Another cleanup batch is running (lock file exists)');
  }
  fs.writeFileSync(lockPath, String(process.pid));
  return lockPath;
}

function releaseLock(lockPath) {
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}

async function findExpiredTodos() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  return Todo.findAll({
    where: {
      completed: true,
      updatedAt: { [Op.lt]: cutoff },
    },
    order: [['updatedAt', 'ASC']],
  });
}

async function main() {
  const force = process.argv.includes('--force');
  let lockPath;

  try {
    lockPath = await acquireLock();
    await sequelize.authenticate();

    logger.info(`Cleanup batch started (mode: ${force ? 'DELETE' : 'DRY-RUN'}, retention: ${RETENTION_DAYS} days)`);

    const expired = await findExpiredTodos();
    logger.info(`Found ${expired.length} expired todos`);

    if (expired.length === 0) {
      logger.info('No todos to clean up');
      return;
    }

    for (const todo of expired) {
      logger.info(`  [${force ? 'DELETE' : 'WOULD DELETE'}] Todo #${todo.id}: "${todo.title}" (updated: ${todo.updatedAt.toISOString()})`);
    }

    if (force) {
      const transaction = await sequelize.transaction();
      try {
        const count = await Todo.destroy({
          where: { id: expired.map(t => t.id) },
          transaction,
        });
        await transaction.commit();
        logger.info(`Deleted ${count} todos`);
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    }

    logger.info('Cleanup batch completed');
  } catch (err) {
    logger.error(`Cleanup batch failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    if (lockPath) releaseLock(lockPath);
    await sequelize.close();
  }
}

main();
