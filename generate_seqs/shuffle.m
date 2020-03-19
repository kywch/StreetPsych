function outSeq = shuffle(inSeq)

lenSeq = length(inSeq);
outSeq = inSeq(randperm(lenSeq));
for ii = 1:10
    % shuffle 10 more times
    outSeq = outSeq(randperm(lenSeq));
end

end