import { $ } from 'zx'

type GetOpenPullRequestNumbersArgs = {
  owner: string
  repo: string
  token: string
}

export const getOpenPullRequestNumbers = async ({
  owner,
  repo,
  token,
}: GetOpenPullRequestNumbersArgs): Promise<number[]> => {
  const GITHUB_API_URL = 'https://api.github.com'
  try {
    const response =
      await $`curl -H "Authorization: token ${token}" ${GITHUB_API_URL}/repos/${owner}/${repo}/pulls?state=open`.quiet()

    const prs = JSON.parse(response.stdout) as Array<{ number: number }>
    return prs.map(({ number }) => number)
  } catch (error) {
    console.error('Error fetching PRs:', error)
    return []
  }
}
