import { Octokit } from '@octokit/rest';
import Logger from '../utils/logger.js';

interface ForkRepo {
    full_name: string;
    description: string;
    stargazers_count: number;
    updated_at: string;
}

interface CacheItem {
    timestamp: number;
    data: ForkRepo[];
}

export class GitHubService {
    private static instance: GitHubService;
    private octokit: Octokit;
    private cache: Map<string, CacheItem>;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly PER_PAGE = 100;

    private constructor() {
        this.octokit = new Octokit();
        this.cache = new Map();
    }

    public static getInstance(): GitHubService {
        if (!GitHubService.instance) {
            GitHubService.instance = new GitHubService();
        }
        return GitHubService.instance;
    }

    private isCacheValid(cacheKey: string): boolean {
        const cached = this.cache.get(cacheKey);
        if (!cached) return false;
        return Date.now() - cached.timestamp < this.CACHE_TTL;
    }

    private getCachedData(cacheKey: string): ForkRepo[] | null {
        if (!this.isCacheValid(cacheKey)) return null;
        return this.cache.get(cacheKey)?.data || null;
    }

    private setCacheData(cacheKey: string, data: ForkRepo[]): void {
        this.cache.set(cacheKey, {
            timestamp: Date.now(),
            data,
        });
    }

    public async listForks(owner: string, repo: string): Promise<ForkRepo[]> {
        const cacheKey = `${owner}/${repo}`;
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
            Logger.debug('Using cached fork data');
            return cachedData;
        }

        try {
            Logger.debug('Fetching forks from GitHub API');
            const forks: ForkRepo[] = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                const response = await this.octokit.repos.listForks({
                    owner,
                    repo,
                    per_page: this.PER_PAGE,
                    page,
                });

                const currentForks = response.data.map(fork => ({
                    full_name: fork.full_name,
                    description: fork.description || '',
                    stargazers_count: fork.stargazers_count || 0,
                    updated_at: fork.updated_at || new Date().toISOString(),
                }));

                forks.push(...currentForks);
                hasMorePages = response.data.length === this.PER_PAGE;
                page++;
            }

            this.setCacheData(cacheKey, forks);
            return forks;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Logger.error(`Failed to fetch forks: ${errorMessage}`);
            throw new Error(`Failed to fetch forks: ${errorMessage}`);
        }
    }

    public async searchForks(owner: string, repo: string, searchTerm: string): Promise<ForkRepo[]> {
        const forks = await this.listForks(owner, repo);
        const lowercaseSearch = searchTerm.toLowerCase();

        return forks.filter(
            fork => fork.full_name.toLowerCase().includes(lowercaseSearch) || fork.description.toLowerCase().includes(lowercaseSearch)
        );
    }

    public async getRepoInfo(owner: string, repo: string): Promise<ForkRepo> {
        try {
            const response = await this.octokit.repos.get({
                owner,
                repo,
            });

            return {
                full_name: response.data.full_name,
                description: response.data.description || '',
                stargazers_count: response.data.stargazers_count,
                updated_at: response.data.updated_at,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Logger.error(`Failed to fetch repository info: ${errorMessage}`);
            throw new Error(`Failed to fetch repository info: ${errorMessage}`);
        }
    }
}
