package com.NanBan.mappers;

import com.sun.tracing.dtrace.ProviderAttributes;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Property;

/**
 * 文章信息 数据库操作接口
 */
public interface ForumArticleMapper<T, P> extends BaseMapper<T, P> {

    /**
     * 根据ArticleId更新
     */
    Integer updateByArticleId(@Param("bean") T t, @Param("articleId") String articleId);


    /**
     * 根据ArticleId删除
     */
    Integer deleteByArticleId(@Param("articleId") String articleId);


    /**
     * 根据ArticleId获取对象
     */
    T selectByArticleId(@Param("articleId") String articleId);

    void updateArticleCount(@Param("updateType") Integer updateType, @Param("changeCount") Integer changeCount,
                            @Param("articleId") String articleId);

    void updateBoardNameBatch(@Param("boardType") Integer boardType, @Param("boardName") String boardName, @Param("boardId") Integer boardId);

    void updateStatusBatchByUserId(@Param("status") Integer status, @Param("userId") String userId);
}
