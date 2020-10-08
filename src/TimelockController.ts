import {
	TimelockController as TimelockControllerContract,
	CallExecuted as CallExecutedEvent,
	CallScheduled as CallScheduledEvent,
	Cancelled as CancelledEvent,
	MinDelayChange as MinDelayChangeEvent,
	RoleAdminChanged as RoleAdminChangedEvent,
	RoleGranted as RoleGrantedEvent,
	RoleRevoked as RoleRevokedEvent,
} from '../generated/TimelockController/TimelockController'

import {
	Target,
	Transaction,
	Operation,
	Call,
	Executed,
	Scheduled,
	Cancelled,
	MinDelayChange,
	Account,
	Role,
	AccessControlPair,
	RoleGranted,
	RoleRevoked,
} from '../generated/schema'

import { store } from '@graphprotocol/graph-ts'

import {
	createEventID,
	logTransaction,
	toETH,
} from './utils'

export function handleCallScheduled(event: CallScheduledEvent): void
{
	let operation         = new Operation(event.params.id.toHex())
	operation.status      = "SCHEDULED"
	operation.delay       = event.params.delay
	operation.timestamp   = event.block.timestamp + event.params.delay
	operation.predecessor = event.params.predecessor ? event.params.predecessor.toHex() : null
	operation.save()

	let target            = new Target(event.params.target.toHex())
	target.save()

	let call              = new Call(operation.id.concat('-').concat(event.params.index.toString()))
	call.operation        = operation.id
	call.index            = event.params.index
	call.target           = target.id
	call.value            = toETH(event.params.value)
	call.data             = event.params.data
	call.save()

	let ev                = new Scheduled(createEventID(event))
	ev.transaction        = logTransaction(event).id
	ev.timestamp          = event.block.timestamp
	ev.operation          = operation.id
	ev.call               = call.id
	ev.save()
}

export function handleCallExecuted(event: CallExecutedEvent): void {
	let operation         = new Operation(event.params.id.toHex())
	operation.status      = "EXECUTED"
	operation.save()

	let call              = new Call(operation.id.concat('-').concat(event.params.index.toString()))
	// todo ?

	let ev                = new Executed(createEventID(event))
	ev.transaction        = logTransaction(event).id
	ev.timestamp          = event.block.timestamp
	ev.operation          = operation.id
	ev.call               = call.id
	ev.save()
}

export function handleCancelled(event: CancelledEvent): void {
	let operation         = new Operation(event.params.id.toHex())
	operation.status      = "CANCELED"
	operation.save()

	let ev                = new Cancelled(createEventID(event))
	ev.transaction        = logTransaction(event).id
	ev.timestamp          = event.block.timestamp
	ev.operation          = operation.id
	ev.save()
}

export function handleMinDelayChange(event: MinDelayChangeEvent): void {
	let ev                = new MinDelayChange(createEventID(event))
	ev.transaction        = logTransaction(event).id
	ev.timestamp          = event.block.timestamp
	ev.mindelay           = event.params.newDuration
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
	let role              = new Role(event.params.role.toHex())
	role.save()

	let account           = new Account(event.params.account.toHex())
	if (role.id == "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775") account.isAdmin    = true
	if (role.id == "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1") account.isProposer = true
	if (role.id == "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63") account.isExecutor = true
	account.save()

	let sender            = new Account(event.params.sender.toHex())
	sender.save()

	let pair              = new AccessControlPair(account.id.concat('-').concat(role.id))
	pair.account          = account.id
	pair.role             = role.id
	pair.save()

	let ev                = new RoleGranted(createEventID(event))
	ev.transaction        = logTransaction(event).id
	ev.timestamp          = event.block.timestamp
	ev.account            = account.id
	ev.role               = role.id
	ev.sender             = sender.id
	ev.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
	let role              = new Role(event.params.role.toHex())
	role.save()

	let account           = new Account(event.params.account.toHex())
	if (role.id == "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775") account.isAdmin    = false
	if (role.id == "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1") account.isProposer = false
	if (role.id == "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63") account.isExecutor = false
	account.save()

	let sender            = new Account(event.params.sender.toHex())
	sender.save()

	store.remove('AccessControlPair', account.id.concat('-').concat(role.id))

	let ev                = new RoleRevoked(createEventID(event))
	ev.transaction        = logTransaction(event).id
	ev.timestamp          = event.block.timestamp
	ev.account            = account.id
	ev.role               = role.id
	ev.sender             = sender.id
	ev.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
	let admin              = new Role(event.params.newAdminRole.toHex())
	admin.save()

	let role              = new Role(event.params.role.toHex())
	role.admin            = admin.id
	role.save()
}
