/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
import React, { useState, useEffect } from 'react'
import { executeQuery } from '@datocms/cda-client'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { PersonRecord, DepartmentNode, DepartmentTree, Department } from 'types'
import BaseLayout from '../../layouts/base'
import query from './query.graphql'
import {
	findChildrenDepartments,
	departmentRecordsToDepartmentTree,
} from '../../utilities'
import Profile from 'components/profile'
import Search from 'components/search'
import DepartmentFilter from 'components/departmentFilter'
import style from './style.module.css'
import { useFetchPeople } from 'hooks/useFetchPeople'
import { useFilterQuery } from 'hooks/useFilterQuery'

interface Props {
	allPeople: PersonRecord[]
	departmentTree: DepartmentTree
}

export const getStaticProps: GetStaticProps = async () => {
	try {
		const result = await executeQuery<{
			allPeople: PersonRecord[]
			allDepartments: DepartmentNode[]
		}>(query, {
			token: `${process.env.DATO_API_TOKEN}`,
		})

		const data = {
			allPeople: result.allPeople,
			allDepartments: result.allDepartments,
		}

		return {
			props: {
				allPeople: data.allPeople,
				departmentTree: departmentRecordsToDepartmentTree(data.allDepartments),
			},
		}
	} catch (err) {
		console.error('Error loading data:', err)
		return {
			props: {
				allPeople: [],
				departmentTree: departmentRecordsToDepartmentTree([]),
			},
		}
	}
}

export default function PeoplePage({
	allPeople,
	departmentTree,
}: Props): React.ReactElement {
	const router = useRouter()
	const [searchingName, setSearchingName] = useState('')
	const [hideNoImage, sethideNoImage] = useState(false)
	const [filteredDepartments, setFilteredDepartments] = useState<
		DepartmentNode[]
	>([])
	const [people, setPeople] = useState<PersonRecord[]>(allPeople)
	const [chosenDepartment, setchosenDepartment] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	useFilterQuery({
		setSearchingName,
		setHideNoImage: sethideNoImage,
		setChosenDepartment: setchosenDepartment,
	})

	useFetchPeople({
		searchingName,
		hideNoImage,
		chosenDepartment,
		setPeople,
		setLoading,
	})

	function clearFiltersHandler() {
		setFilteredDepartments([])
		setchosenDepartment(null)

		const newQuery = { ...router.query }
		delete newQuery.department

		router.push(
			{
				pathname: router.pathname,
				query: newQuery,
			},
			undefined,
			{ shallow: true }
		)
	}

	function selectFilterHandler(departmentFilter: Department) {
		const totalDepartmentFilter = findChildrenDepartments(
			departmentTree,
			departmentFilter.id
		)
		setFilteredDepartments(totalDepartmentFilter)

		const departmentString = totalDepartmentFilter
			.map((dept) => dept.id)
			.join(',')

		setchosenDepartment(departmentString)
	}

	const filteredDepartmentIds = filteredDepartments.reduce(
		(acc: string[], department: DepartmentNode) => [...acc, department.id],
		[]
	)

	return (
		<main className="g-grid-container">
			<section className={style['search-container']}>
				<h1>HashiCorp Humans</h1>
				<h5>Find a HashiCorp human</h5>
				<Search
					onInputChange={(e) => setSearchingName(e.target.value)}
					onProfileChange={(e) => sethideNoImage(e.target.checked)}
					hideNoImageChecked={hideNoImage}
				/>
			</section>
			<section className={style['department-results-container']}>
				<aside>
					<DepartmentFilter
						filteredDepartmentIds={filteredDepartmentIds}
						clearFiltersHandler={clearFiltersHandler}
						selectFilterHandler={selectFilterHandler}
						departmentTree={departmentTree}
					/>
				</aside>
				{loading ? (
					<div>Loading...</div>
				) : (
					<ul className={style['people-results']}>
						{people.length === 0 ? (
							<div>No results found.</div>
						) : (
							people.map((person: PersonRecord) => {
								return (
									<li className={style['person']} key={person.id}>
										<Profile
											imgUrl={person['avatar_url']}
											name={person.name}
											title={person.title}
											department={person['department_name']}
										/>
									</li>
								)
							})
						)}
					</ul>
				)}
			</section>
		</main>
	)
}

PeoplePage.layout = BaseLayout
