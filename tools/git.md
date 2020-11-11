## git操作
* git blame
查找某一行的修改历史
```
git blame file_name
git blame -L 58, 100 file_name # 58-100行代码
```
* git revert
git revert <commit>撤销指定的提交，要撤销一串可以用 git revert <commit1>..<commit2>，这是一个前开后闭区间，即不包括 commit1，但包括 commit2
撤销后还需要进行一次提交：`git commit -a -m 'This reverts commit 7e345c9 and 551c408'`

* git diff
如果对比撤销后一个commit到head前一个commit与撤销前一个commit与head的diff相同，则revert成功。

* git cherry-pick
将指定的提交commit或分支名应用于当前分支
支持多次commit: `A..B`
在操作中发生代码冲突，使用add与cherry-pick --continue解决冲突
