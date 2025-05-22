import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function useFetchPeople({
	searchingName,
	hideNoImage,
	chosenDepartment,
	setPeople,
	setLoading,
}: {
	searchingName: string
	hideNoImage: boolean
	chosenDepartment: string | null
	setPeople: (people: any[]) => void
	setLoading: (loading: boolean) => void
}) {
	const router = useRouter()

	useEffect(() => {
		if (!router.isReady) {
			return
		}

		const fetchPeople = async () => {
			setLoading(true)
			try {
				const query: Record<string, string> = {}
				if (searchingName.trim()) {
					query.search = searchingName.trim()
				}
				if (hideNoImage) {
					query.hideNoImage = 'true'
				}
				if (chosenDepartment) {
					query.department = chosenDepartment
				}

				router.push({ pathname: router.pathname, query }, undefined, {
					shallow: true,
				})

				const params = new URLSearchParams(query).toString()
				const response = await fetch(`/api/hashicorp?${params}`)
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
	}, [searchingName, hideNoImage, chosenDepartment, router.isReady])
}
