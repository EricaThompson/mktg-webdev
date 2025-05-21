/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { PersonRecord } from 'types'
import Database from 'better-sqlite3'
import 'dotenv/config'

type ResponseData = {
	results: PersonRecord[]
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData>
) {
	const { query } = req
	const searchParam = (query.search as string) || ''
	const hideNoPicture = (query.hideNoPicture as string) || ''
	const departmentSort = (query.department as string) || ''
	const departmentIds = departmentSort.split(',')
	const placeholders = departmentIds.map(() => '?').join(', ')
	console.log('depart:', departmentSort)

	let results: PersonRecord[]

	try {
		const db = new Database('hashicorp.sqlite')
		let statement = null

		if (departmentSort) {
			statement = db.prepare(`
					SELECT *
					FROM people
					WHERE department_id IN (${placeholders})
				`)
			results = statement.all(...departmentIds) as PersonRecord[]
		} else if (searchParam === '') {
			statement = db.prepare(`
					SELECT *
					FROM people
				`)
			results = statement.all() as PersonRecord[]
		} else if (hideNoPicture === 'true') {
			statement = db.prepare(`
					SELECT *
					FROM people
					WHERE avatar_url IS NOT NULL
					AND name LIKE '%' || ? || '%' 
				`)
			results = statement.all(searchParam) as PersonRecord[]
		} else {
			statement = db.prepare(`
				SELECT *
				FROM people
				WHERE name LIKE '%' || ? || '%' 
			`)
			results = statement.all(searchParam) as PersonRecord[]
		}

		db.close()

		res.status(200).json({ results })
	} catch (err) {
		console.error('Query failed:', err)
		res.status(500).json({ results: [] })
	}
}
