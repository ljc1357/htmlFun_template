// 图片懒加载实现
(function () {
  // 检查浏览器是否支持IntersectionObserver
  const isIntersectionObserverSupported = "IntersectionObserver" in window;

  // 创建 IntersectionObserver 实例（如果支持）
  const observer = isIntersectionObserverSupported
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const delay = img.getAttribute("lazy-delay");
            
            // 先设置占位符
            setupPlaceholder(img);
            
            if (delay && !isNaN(parseInt(delay))) {
              setTimeout(() => {
                loadImage(img);
                observer.unobserve(img);
              }, parseInt(delay));
            } else {
              loadImage(img);
              observer.unobserve(img);
            }
          }
        });
      }, {
        // 配置IntersectionObserver以检测元素何时变为可见
        // 即使元素最初是隐藏的，当它变为可见时也会触发
        rootMargin: "0px",
        threshold: 0.01
      })
    : null;

  // 设置占位符函数
  function setupPlaceholder(img) {
    const placeholder = img.getAttribute("lazy-placeholder");
    if (!placeholder) return;
    
    // 如果已经设置了占位符，不重复设置
    if (img.hasAttribute("placeholder-setup")) return;
    
    const parent = img.parentElement;
    if (!parent) return;
    
    parent.style.overflow = "hidden";
    
    let placeholderElement;
    if (placeholder.startsWith("#")) {
      // 如果是ID选择器
      const placeholderDom = document.querySelector(placeholder);
      if (placeholderDom) {
        placeholderElement = placeholderDom.cloneNode(true);
        placeholderElement.style.display = "block";
      }
    } else {
      // 如果是HTML字符串
      const temp = document.createElement("div");
      temp.innerHTML = placeholder;
      placeholderElement = temp.firstElementChild;
    }

    if (placeholderElement) {
      placeholderElement.style.width = "100%";
      placeholderElement.style.height = "100%";
      img.style.display = "none";
      parent.insertBefore(placeholderElement, img);
      
      // 标记占位符已设置
      img.setAttribute("placeholder-setup", "true");
      img.setAttribute("placeholder-element-id", Date.now().toString());
      placeholderElement.setAttribute("data-placeholder-id", img.getAttribute("placeholder-element-id"));
    }
  }

  // 加载图片函数
  function loadImage(img) {
    const lazySrc = img.getAttribute("lazy-src");
    if (!lazySrc) return;

    // 清除延迟标记（如果存在）
    img.removeAttribute("lazy-delay-started");

    // 设置父容器样式
    const parent = img.parentElement;
    if (!parent) return;

    // 获取之前设置的占位符
    const placeholderId = img.getAttribute("placeholder-element-id");
    const placeholderElement = placeholderId ? 
      parent.querySelector(`[data-placeholder-id="${placeholderId}"]`) : null;

    // 图片加载成功处理
    img.onload = function () {
      img.style.display = "";
      img.style.width = "100%";
      img.style.height = "100%";
      
      // 移除占位符
      if (placeholderElement) {
        placeholderElement.style.display = "none";
        parent.removeChild(placeholderElement);
      }

      // 清除懒加载相关属性
      img.removeAttribute("lazy-src");
      img.removeAttribute("lazy-placeholder");
      img.removeAttribute("lazy-delay");
      img.removeAttribute("placeholder-setup");
      img.removeAttribute("placeholder-element-id");
    };
    
    // 设置图片源
    img.src = lazySrc;
  }

  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }

  // 检查元素是否在视口内且可见
  function isElementInViewport(el) {
    // 检查元素或其任何父元素是否为display:none
    function isVisible(element) {
      if (!element) return true;
      
      // 获取元素的计算样式
      const style = window.getComputedStyle(element);
      if (style.display === 'none') return false;
      
      // 递归检查父元素
      return isVisible(element.parentElement);
    }
    
    // 如果元素不可见，直接返回false
    if (!isVisible(el)) return false;
    
    // 检查元素是否在视口内
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // 滚动事件处理函数
  function handleScroll() {
    const lazyImages = document.querySelectorAll("img[lazy-src]");
    lazyImages.forEach((img) => {
      if (isElementInViewport(img)) {
        // 先设置占位符
        setupPlaceholder(img);
        
        const delay = img.getAttribute("lazy-delay");
        if (delay && !isNaN(parseInt(delay))) {
          // 如果设置了延迟且尚未开始延迟加载
          if (!img.hasAttribute("lazy-delay-started")) {
            img.setAttribute("lazy-delay-started", "true");
            setTimeout(() => {
              loadImage(img);
            }, parseInt(delay));
          }
        } else {
          loadImage(img);
        }
      }
    });
    
    // 如果没有需要懒加载的图片了，移除滚动事件监听
    if (document.querySelectorAll("img[lazy-src]").length === 0) {
      window.removeEventListener("scroll", debouncedHandleScroll);
      window.removeEventListener("resize", debouncedHandleScroll);
      document.removeEventListener("DOMSubtreeModified", debouncedHandleScroll);
    }
  }

  // 创建防抖版本的滚动处理函数
  const debouncedHandleScroll = debounce(handleScroll, 200);

  // 使用滚动事件实现懒加载（用于不支持IntersectionObserver的浏览器）
  function setupScrollBasedLazyLoad() {
    // 初始检查一次视口内的图片
    handleScroll();
    
    // 添加滚动事件监听（使用防抖）
    window.addEventListener("scroll", debouncedHandleScroll);
    
    // 添加调整窗口大小事件监听（使用防抖）
    window.addEventListener("resize", debouncedHandleScroll);
    
    // 监听DOM变化，处理父元素从display:none变为block的情况
    document.addEventListener("DOMSubtreeModified", debouncedHandleScroll);
    
    // 使用MutationObserver监听DOM变化（如果浏览器支持）
    if (window.MutationObserver) {
      const mutationObserver = new MutationObserver(debouncedHandleScroll);
      mutationObserver.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  // 初始化函数
  function init() {
    if (isIntersectionObserverSupported) {
      // 支持IntersectionObserver，使用懒加载
      const lazyImages = document.querySelectorAll("img[lazy-src]");
      lazyImages.forEach((img) => {
        observer.observe(img);
      });
    } else {
      // 不支持IntersectionObserver，使用基于滚动事件的懒加载
      setupScrollBasedLazyLoad();
    }
  }

  // 当DOM加载完成后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
