/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
import { GetStaticPropsResult } from 'next'
import s from './style.module.css'
import Nav from 'layouts/base/components/nav'
import Footer from 'layouts/base/components/footer'
import PeoplePage from 'pages/people'

interface Props {}

export default function IndexPage({}: Props): React.ReactElement {
  return (
    <main className={s.root}>
		<Nav data={{ 
			infrastructureProducts: [], 
			securityProducts: [], 
			networkingProducts: [], 
			applicationProducts: [], 
			hcpDescription: '', 
			hcpProducts: [], 
			hcpCta: [], 
			productsPromos: [], 
			solutionsNav: [], 
			solutionsPromos: [], 
			companyNav: [], 
			companyPromos: [], 
			learnNav: [], 
			learnPromos: [], 
			supportNav: [], 
			supportPromos: [] 
		}} />

		<PeoplePage allPeople={[]} departmentTree={[]}/>
		<Footer />

    </main>
  )
}

// No need to load external files, so we return an empty object
export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  return { props: {} }
}
