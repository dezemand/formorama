export class ChangeSet {

}

// export class Change {
//   private path: Path;
//   private value: any;
//
//   static create(prevValues: any, path: Path, newValue: any): Change {
//     let changePath: Path = [];
//     let newValueTree = setTreeValue({}, path, newValue);
//
//     for(const pathNode of path) {
//       changePath = [...changePath, pathNode];
//       newValueTree = getTreeValue(newValueTree, [pathNode]);
//
//       if (getTreeValue(prevValues, changePath) === null) break;
//     }
//
//     changeSet.push({
//       path: changePath,
//       value: newValueTree
//     });
//
//   }
// }
