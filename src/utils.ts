import {
	BigInt,
	BigDecimal,
	ethereum,
} from '@graphprotocol/graph-ts'

import {
	Transaction,
} from '../generated/schema'

export function createEventID(event: ethereum.Event): string
{
	return event.block.number.toString().concat('-').concat(event.logIndex.toString())
}

export function logTransaction(event: ethereum.Event): Transaction
{
	let tx = new Transaction(event.transaction.hash.toHex());
	// tx.from        = fetchAccount(event.transaction.from.toHex()).id;
	// tx.to          = fetchAccount(event.transaction.to.toHex()  ).id;
	// tx.value       = event.transaction.value;
	// tx.gasUsed     = event.transaction.gasUsed;
	// tx.gasPrice    = event.transaction.gasPrice;
	tx.timestamp   = event.block.timestamp;
	tx.blockNumber = event.block.number;
	tx.save();
	return tx as Transaction;
}

export function toETH(value: BigInt): BigDecimal
{
	return value.divDecimal(BigDecimal.fromString('1000000000000000000'))
}
