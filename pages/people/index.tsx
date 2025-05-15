import React, { useState, useEffect } from 'react'
import { executeQuery } from '@datocms/cda-client'
import { GetStaticProps } from 'next'
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
			departmentTree: departmentRecordsToDepartmentTree(result.allDepartments),
		}

		return {
			props: {
				allPeople: data.allPeople,
				departmentTree: data.departmentTree,
			},
		}
	} catch (error) {
		console.error('Error loading data:', error)
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
	const [searchingName, setSearchingName] = useState('')
	// const [hideNoPicture, setHideNoPicture] = useState(false)
	const [filteredDepartments, setFilteredDepartments] = useState<
		DepartmentNode[]
	>([])
	const [people, setPeople] = useState<PersonRecord[]>(allPeople)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const fetchPeople = async () => {
			setLoading(true)
			try {
				const queryParam =
					searchingName.trim() !== '' ? `?search=${searchingName.trim()}` : ''
				const response = await fetch(`/api/hashicorp${queryParam}`)
				const data = await response.json()
				setPeople(data.results)
			} catch (error) {
				console.error('Error fetching people:', error)
				setPeople([])
			} finally {
				setLoading(false)
			}
		}

		const timeoutId = setTimeout(fetchPeople, 300)
		return () => clearTimeout(timeoutId)
	}, [searchingName])

	// const displayedPeople = people.filter(person => {
	//     return !hideNoPicture || (person.avatar && person.avatar.url)
	// })

	return (
		<main className="g-grid-container">
			<div>
				<h1>HashiCorp Humans</h1>
				<Search
					onInputChange={(e) => setSearchingName(e.target.value)}
					onProfileChange={(e) => setHideNoPicture(e.target.checked)}
				/>
			</div>
			<aside>
				{/* <DepartmentFilter
                    filteredDepartmentIds={filteredDepartments.map(dept => dept.id)}
                    clearFiltersHandler={() => setFilteredDepartments([])}
                    selectFilterHandler={(departmentFilter: Department) => {
                        // const totalDepartmentFilter = findDepartments(departmentTree, departmentFilter.id)
                        // setFilteredDepartments(totalDepartmentFilter)
                    }}
                    departmentTree={departmentTree}
                /> */}
			</aside>
			{loading ? (
				<div>Loading...</div>
			) : (
				<ul>
					{people.length === 0 && <div>No results found.</div>}
					{people.map((person: PersonRecord) => {
						console.log('person', person)
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
					})}
				</ul>
			)}
		</main>
	)
}

PeoplePage.layout = BaseLayout
