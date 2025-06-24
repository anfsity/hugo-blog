---
title: Test
date: 2025-06-24
draft: true
---

```C++
#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
#include <queue>
using std:: cout;
using std:: cin;            
using i64 = long long;
using u64 = unsigned long long;
#define nl '\n'

void solve() {
    // 训练！！！
    // 专注！！！
    int n , m;
    cin >> n >> m;
    std::vector<std::vector<int>> map(n, std::vector<int>(m, 0));
    // int min = INT_MAX;
    for(auto &i : map) {
        for(auto& j : i) {
            cin >> j;
            // min = std::min(j, min);
        }
    }

    std::vector<std::vector<int>> dp(n, std::vector<int>(m, 1));
    std::queue<std::pair<int, int>> Q;
    for(int i = 0; i < n; ++i) {
        for(int j = 0; j < m; ++j) {
            // if(map[i][j] <= min + 10) {
            //     Q.push({i, j});
            // }
            Q.push({i, j});
        }
    }

    int dx[] = {-1, 1, 0, 0};
    int dy[] = {0, 0, -1, 1};

    auto update = [&](int x, int y) -> void {
        for(int i = 0; i < 4; ++i) {
            int xx = x + dx[i], yy = y + dy[i];
            if(xx < 0 || yy < 0 || xx >= n || yy >= m || map[x][y] >= map[xx][yy]) 
                continue;
           
            if(dp[xx][yy] < dp[x][y] + 1) {
                dp[xx][yy] = dp[x][y] + 1;
                Q.push({xx, yy});
                // std::cerr << map[xx][yy] << nl;
            }            
        }
    };

    while(not Q.empty()) {
        auto [x, y] = Q.front();
        Q.pop();

        update(x, y);
    }



    int ans = 0;
    for(auto& i : dp) {
        int t = std::ranges::max(i);
        ans = std::max(t , ans);
    }

    cout << ans << nl;

}

int main() 
{
    cin.tie(nullptr) -> std::ios::sync_with_stdio(false);
    int T = 1;
    // cin >> T;
    while (T--) {
        solve();
    }
    return 0;
}


```

