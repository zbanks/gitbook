#/bin/bash
cd ..
git commit -am "Saved"
cd friends
for FR in `ls -d /*`
do cd $FR
   git commit -am "Saved" && git push origin master
   cd ..
done;
