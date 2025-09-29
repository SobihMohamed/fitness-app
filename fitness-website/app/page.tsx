import { HomePage } from "./home/page"
import { API_CONFIG } from "@/config/api"

export const revalidate = 300 // ISR: re-generate every 5 minutes

type Json = any

async function safeJson(res: Response): Promise<Json | null> {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export default async function Home() {
  const [productsRes, coursesRes] = await Promise.all([
    fetch(API_CONFIG.USER_FUNCTIONS.products.getAll, { next: { revalidate } }),
    fetch(API_CONFIG.USER_FUNCTIONS.courses.getAll, { next: { revalidate } }),
  ])

  const [productsJson, coursesJson] = await Promise.all([
    safeJson(productsRes),
    safeJson(coursesRes),
  ])

  const featuredProducts = Array.isArray(productsJson)
    ? productsJson
    : (productsJson?.data || productsJson?.products || [])

  const featuredCourses = Array.isArray(coursesJson)
    ? coursesJson
    : (coursesJson?.data || coursesJson?.courses || [])

  return (
    <HomePage
      initialFeaturedProducts={featuredProducts}
      initialFeaturedCourses={featuredCourses}
    />
  )
}
