import React, { useState, useEffect } from 'react'
import { executeQuery } from '@datocms/cda-client'
import { GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { PersonRecord, DepartmentNode, DepartmentTree, Department } from 'types'
import BaseLayout from '../../layouts/base'
import query from './query.graphql'
import {
	findDepartments,
	departmentRecordsToDepartmentTree,
} from '../../utilities'
import Profile from 'components/profile'
import Search from 'components/search'
import DepartmentFilter from 'components/departmentFilter'
import style from './style.module.css'

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
	const [hideNoPicture, setHideNoPicture] = useState(false)
	const [filteredDepartments, setFilteredDepartments] = useState<
		DepartmentNode[]
	>([])
	const [people, setPeople] = useState<PersonRecord[]>(allPeople)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!router.isReady) {
			return
		}

		const { search, hideNoPicture: hideNoPictureParam } = router.query

		if (search && typeof search === 'string' && search !== searchingName) {
			setSearchingName(search)
		}

		const shouldHideNoPicture = hideNoPictureParam === 'true'
		if (shouldHideNoPicture !== hideNoPicture) {
			setHideNoPicture(shouldHideNoPicture)
		}
	}, [router.isReady, router.query])

	useEffect(() => {
		if (!router.isReady) {
			return
		}
		const fetchPeople = async () => {
			setLoading(true)
			try {
				const query = {}

				if (searchingName.trim()) {
					query['search'] = searchingName.trim()
				}

				if (hideNoPicture) {
					query['hideNoPicture'] = 'true'
				}

				router.push(
					{
						pathname: router.pathname,
						query,
					},
					undefined,
					{ shallow: true }
				)

				let queryParam = ''
				if (hideNoPicture) {
					queryParam += '?hideNoPicture=true'
				}

				if (searchingName.trim()) {
					queryParam += queryParam
						? `&search=${encodeURIComponent(searchingName.trim())}`
						: `?search=${encodeURIComponent(searchingName.trim())}`
				}

				const response = await fetch(`/api/hashicorp${queryParam}`)
				const data = await response.json()
				setPeople(data.results)
			} catch (err) {
				console.error('Error fetching people:', err)
				setPeople([])
			} finally {
				setLoading(false)
			}
		}

		const timeoutId = setTimeout(fetchPeople, 300)
		return () => clearTimeout(timeoutId)
	}, [searchingName, hideNoPicture, router.isReady])

	const filteredDepartmentIds = filteredDepartments.reduce(
		(acc: string[], department: DepartmentNode) => [...acc, department.id],
		[]
	)

	return (
		<main className="g-grid-container">
			<div>
				<h1>HashiCorp Humans</h1>
				<Search
					onInputChange={(e) => setSearchingName(e.target.value)}
					onProfileChange={(e) => setHideNoPicture(e.target.checked)}
				/>
			</div>
			<section className={style['department-results-container']}>
				<aside>
					<DepartmentFilter
						filteredDepartmentIds={filteredDepartmentIds}
						clearFiltersHandler={() => {
							setFilteredDepartments([])
						}}
						selectFilterHandler={(departmentFilter: Department) => {
							const totalDepartmentFilter = findDepartments(
								departmentTree,
								departmentFilter.id
							)
							setFilteredDepartments(totalDepartmentFilter)
						}}
						departmentTree={departmentTree}
					/>
				</aside>
				{loading ? (
					<div>Loading...</div>
				) : (
					<ul>
						{people.length === 0 ? (
							<div>No results found.</div>
						) : (
							people.map((person: PersonRecord) => {
								return (
									<li key={person.id}>
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
