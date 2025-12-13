export type RefreshTokenAdapterOptions<T, U> = {
  refreshTokenFetcher: (input: T) => Promise<U>;

  fetcherInput: T;

  /**
   * 캐시된 엑세스 토큰의 최대 유지 시간입니다. (단위: ms)
   *
   * @default 1000
   */
  cacheMaxAge?: number;

  /**
   * refreshAccessTokenFetcher 함수가 최대 실행 가능한 시간입니다. (단위: ms)
   *
   * @default 5000
   */
  timeout?: number;
};

/**
 * Refresh Token을 구현하기 위한 어댑터입니다.
 */
export class RefreshTokenAdapter<T, U> {
  private cachedObject: U | null = null;
  private queue: Array<[(value: U) => void, (reason?: any) => void]> = [];
  private isFetching = false;

  private refreshTokenFetcher: RefreshTokenAdapterOptions<
    T,
    U
  >["refreshTokenFetcher"];
  private fetcherInput: T;
  private cacheMaxAge: number;
  private timeout: number;
  private timeoutHandler: ReturnType<typeof setTimeout> | null = null;

  constructor(options: RefreshTokenAdapterOptions<T, U>) {
    this.refreshTokenFetcher = options.refreshTokenFetcher;
    this.fetcherInput = options.fetcherInput;
    this.cacheMaxAge = options.cacheMaxAge ?? 1000;
    this.timeout = options.timeout ?? 5000;
  }

  /**
   * 토큰을 갱신하고, 갱신된 토큰을 반환합니다.
   */
  async getRefreshedAccessToken(error?: unknown) {
    // 토큰이 캐시되어 있다면, 캐시된 토큰을 반환합니다.
    if (!!this.cachedObject) return this.cachedObject;

    // 이미 토큰을 갱신하는 중이라면, 토큰이 갱신될 때까지 재요청하지 않고 대기합니다.
    if (this.isFetching)
      return new Promise<U>((resolve, reject) =>
        this.queue.push([resolve, reject])
      );

    this.isFetching = true;

    return new Promise<U>(async (resolve, reject) => {
      const rejectWrapper = (reason?: any) => {
        if (this.timeoutHandler !== null) {
          clearTimeout(this.timeoutHandler);
          this.timeoutHandler = null;
        }

        this.isFetching = false;
        this.queue.forEach(([, queueReject]) => queueReject(reason));
        reject(reason);
      };

      try {
        const promise = this.refreshTokenFetcher(this.fetcherInput);

        this.timeoutHandler = setTimeout(() => {
          rejectWrapper(error ?? "토큰 갱신 요청 시간 초과");
        }, this.timeout);

        const newToken = await promise;
        this.cachedObject = newToken;

        clearTimeout(this.timeoutHandler);

        // cacheMaxAge 이후에 캐시된 토큰을 삭제합니다.
        setTimeout(() => {
          this.cachedObject = null;
        }, this.cacheMaxAge);

        this.isFetching = false;

        // 토큰이 갱신되었으므로, 대기중인 모든 promise를 resolve합니다.
        this.queue.forEach(([queueResolve]) => queueResolve(newToken));

        resolve(this.cachedObject);
      } catch (err) {
        rejectWrapper(err);
      }
    });
  }
}
