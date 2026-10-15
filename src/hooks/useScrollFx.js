import { useEffect } from "react";

const sinMovimiento = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Hace aparecer (fade + subida) los elementos con la clase "af-reveal" que estén dentro de rootRef
 * cuando entran en pantalla. Los que entran juntos (por ejemplo una fila de cards) salen escalonados.
 * Se vuelve a correr cuando cambian las deps (filtros, orden) para tomar las cards nuevas.
 * Usa un data-attribute (no className) para que React no lo pise en los re-render.
 */
export const useReveal = (rootRef, deps = []) => {
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;
        const pendientes = [...root.querySelectorAll(".af-reveal:not([data-in])")];
        if (pendientes.length === 0) return undefined;

        if (sinMovimiento() || !("IntersectionObserver" in window)) {
            pendientes.forEach((el) => el.setAttribute("data-in", ""));
            return undefined;
        }

        document.documentElement.classList.add("af-fx");
        const io = new IntersectionObserver(
            (entries) => {
                let orden = 0;
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    el.style.setProperty("--af-delay", `${Math.min(orden, 5) * 70}ms`);
                    el.setAttribute("data-in", "");
                    io.unobserve(el);
                    orden += 1;
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
        );
        pendientes.forEach((el) => io.observe(el));
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

/**
 * Parallax del hero: publica --hero-p (0 arriba, 1 cuando el hero ya salió de pantalla)
 * para que el CSS mueva el texto y el brillo verde mientras se baja.
 */
export const useHeroParallax = (heroRef, activo) => {
    useEffect(() => {
        const hero = heroRef.current;
        if (!activo || !hero || sinMovimiento()) return undefined;
        let frame = 0;
        const actualizar = () => {
            frame = 0;
            const alto = hero.offsetHeight || 1;
            const p = Math.min(Math.max(window.scrollY / alto, 0), 1);
            hero.style.setProperty("--hero-p", p.toFixed(3));
        };
        const alScrollear = () => {
            if (!frame) frame = requestAnimationFrame(actualizar);
        };
        actualizar();
        window.addEventListener("scroll", alScrollear, { passive: true });
        window.addEventListener("resize", alScrollear);
        return () => {
            window.removeEventListener("scroll", alScrollear);
            window.removeEventListener("resize", alScrollear);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [heroRef, activo]);
};
