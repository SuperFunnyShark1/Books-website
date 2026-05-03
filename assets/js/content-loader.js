/* global window, document, fetch */
(function () {
	"use strict";

	function byId(id) {
		return document.getElementById(id);
	}

	function setText(el, text) {
		if (el && typeof text === "string") {
			el.textContent = text;
		}
	}

	function setFooterBackground(globalData) {
		const footer = byId("footer");
		const image = globalData?.site?.pieDePagina?.imagenFondo;
		if (!footer || !image) return;
		footer.style.backgroundImage =
			"linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('" +
			image +
			"')";
		footer.style.backgroundSize = "cover";
		footer.style.backgroundPosition = "center";
	}

	function renderGlobal(globalData, pageData, pageName) {
		const brand = globalData?.site?.marcaCabecera;
		const openMenu = globalData?.site?.menu?.etiquetaAbrir;
		const menu = globalData?.site?.menu;
		const useTemplateMenu = pageName === "generic" || pageName === "elements";
		const links = useTemplateMenu ? menu?.enlacesPlantillaHtml5Up : menu?.enlacesClub;

		document.querySelectorAll("#header h1 a").forEach(function (a) {
			if (brand?.texto) a.textContent = brand.texto;
			if (brand?.enlace) a.setAttribute("href", brand.enlace);
		});
		document.querySelectorAll("#header nav a[href='#menu']").forEach(function (a) {
			if (openMenu) a.textContent = openMenu;
		});

		document.querySelectorAll("#menu .inner h2").forEach(function (h2) {
			setText(h2, menu?.titulo || "Menu");
		});
		document.querySelectorAll("#menu .close").forEach(function (a) {
			setText(a, menu?.textoCerrar || "Close");
		});
		document.querySelectorAll("#menu ul.links").forEach(function (ul) {
			if (!Array.isArray(links)) return;
			ul.innerHTML = links
				.map(function (link) {
					return '<li><a href="' + link.href + '">' + link.texto + "</a></li>";
				})
				.join("");
		});

		setFooterBackground(globalData);
		const copyright = document.querySelector("#footer ul.copyright");
		if (copyright) {
			if (pageData?.pieSinCopyright) {
				copyright.innerHTML = "";
			} else {
				const prefix = globalData?.site?.pieDePagina?.prefijoUltimaActualizacion || "Ultima actualización:";
				const date = globalData?.ultimaActualizacion || "";
				copyright.innerHTML = "<li>" + prefix + " " + date + "</li>";
			}
		}
	}

	function renderIndex(data) {
		document.title = data.tituloDocumento || document.title;
		const banner = byId("banner");
		if (banner && data.banner?.imagenFondo) {
			banner.style.backgroundImage =
				"linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('" +
				data.banner.imagenFondo +
				"')";
			banner.style.backgroundSize = "auto, cover";
			banner.style.backgroundPosition = "center, center";
		}
		setText(document.querySelector("#banner h2"), data.banner?.titulo || "");
		setText(document.querySelector("#four .inner h2.major"), data.seccionPrincipal?.titulo || "");
		setText(document.querySelector("#four .inner > p"), data.seccionPrincipal?.parrafo || "");

		const features = document.querySelector("#four .features");
		if (features && Array.isArray(data.seccionPrincipal?.tarjetas)) {
			features.innerHTML = data.seccionPrincipal.tarjetas
				.map(function (card) {
					return (
						"<article>" +
						'<a href="' + card.enlace + '" class="image"><img src="' + card.imagen + '" alt="' + (card.altImagen || "") + '" /></a>' +
						'<h3 class="major">' + card.titulo + "</h3>" +
						"<p>" + card.descripcion + "</p>" +
						'<a href="' + card.enlace + '" class="special">' + card.textoBoton + "</a>" +
						"</article>"
					);
				})
				.join("");
		}
	}

	function renderFaq(data) {
		document.title = data.tituloDocumento || document.title;
		setText(document.querySelector("#wrapper > header .inner h2"), data.encabezadoPagina?.titulo || "");
		setText(document.querySelector("#wrapper > header .inner p"), data.encabezadoPagina?.subtitulo || "");

		const heroImg = document.querySelector(".faq-hero img");
		if (heroImg && data.hero) {
			heroImg.src = data.hero.imagen || "";
			heroImg.alt = data.hero.alt || "";
			if (data.hero.ancho) heroImg.width = data.hero.ancho;
			if (data.hero.alto) heroImg.height = data.hero.alto;
		}

		const list = document.querySelector("ol.faq-accordion");
		if (list && Array.isArray(data.preguntas)) {
			list.innerHTML = data.preguntas
				.map(function (item) {
					const parts = (item.respuesta || [])
						.map(function (block) {
							if (block.tipo === "parrafo") return "<p>" + block.texto + "</p>";
							if (block.tipo === "imagen") {
								const style = block.estilo ? ' style="' + block.estilo + '"' : "";
								return '<img src="' + block.src + '" alt="' + (block.alt || "") + '"' + style + " />";
							}
							if (block.tipo === "enlace") {
								const target = block.target ? ' target="' + block.target + '"' : "";
								const rel = block.rel ? ' rel="' + block.rel + '"' : "";
								return "<p><a href=\"" + block.href + "\"" + target + rel + ">" + block.texto + "</a></p>";
							}
							return "";
						})
						.join("");
					return "<li><details><summary>" + item.pregunta + '</summary><div class="faq-answer">' + parts + "</div></details></li>";
				})
				.join("");
		}
	}

	function renderCurrentBook(data) {
		document.title = data.tituloDocumento || document.title;
		setText(document.querySelector("#wrapper > header .inner h2"), data.encabezadoPagina?.titulo || "");
		setText(document.querySelector("#wrapper > header .inner p"), data.encabezadoPagina?.subtitulo || "");

		const current = data.libroActual || {};
		setText(document.querySelector(".reading-card--current .reading-card-title"), current.tituloSeccion || "");
		const cover = document.querySelector(".reading-card--current .cover-wrap img");
		if (cover && current.portada) {
			cover.src = current.portada.src || "";
			cover.alt = current.portada.alt || "";
			if (current.portada.ancho) cover.width = current.portada.ancho;
			if (current.portada.alto) cover.height = current.portada.alto;
		}
		setText(document.querySelector(".reading-card--current .book-title"), current.titulo || "");
		setText(document.querySelector(".reading-card--current .book-author"), current.autor || "");
		setText(document.querySelector(".reading-card--current .book-desc"), current.descripcion || "");
		setText(document.querySelector(".reading-card--current .chapters-label"), current.capitulos?.etiqueta || "");
		setText(document.querySelector(".reading-card--current .chapters-nums"), current.capitulos?.numeros || "");

		setText(document.querySelector(".reading-card--list[aria-labelledby='read-heading'] .reading-card-title"), data.librosLeidos?.tituloSeccion || "");
		const done = document.querySelector("ol.reading-done");
		if (done) {
			done.innerHTML = (data.librosLeidos?.elementos || [])
				.map(function (i) {
					return "<li>" + i + "</li>";
				})
				.join("");
		}

		setText(document.querySelector(".reading-card--list[aria-labelledby='suggest-heading'] .reading-card-title"), data.sugerencias?.tituloSeccion || "");
		const suggestions = document.querySelector("ul.reading-suggestions");
		if (suggestions) {
			suggestions.innerHTML = (data.sugerencias?.titulos || [])
				.map(function (i) {
					return "<li>" + i + "</li>";
				})
				.join("");
		}
	}

	function renderDondeCuando(data) {
		document.title = data.tituloDocumento || document.title;
		setText(document.querySelector("#wrapper > header .inner h2"), data.encabezadoPagina?.titulo || "");
		setText(document.querySelector("#wrapper > header .inner p"), data.encabezadoPagina?.subtitulo || "");
		setText(document.querySelector("#social-heading"), data.redesSociales?.tituloSeccion || "");

		const socialLinks = document.querySelector(".social-links");
		if (socialLinks && Array.isArray(data.redesSociales?.enlaces)) {
			socialLinks.innerHTML = data.redesSociales.enlaces
				.map(function (link) {
					const target = link.target ? ' target="' + link.target + '"' : "";
					const rel = link.rel ? ' rel="' + link.rel + '"' : "";
					return (
						'<a class="social-btn social-btn--' +
						link.clase +
						'" href="' +
						link.href +
						'"' +
						target +
						rel +
						">" +
						link.texto +
						"</a>"
					);
				})
				.join("");
		}

		setText(document.querySelector("#place-heading"), data.lugarReunion?.tituloSeccion || "");
		const meetMeta = document.querySelector(".meet-meta");
		if (meetMeta) {
			const label = data.lugarReunion?.fecha?.etiqueta || "";
			const text = data.lugarReunion?.fecha?.texto || "";
			meetMeta.innerHTML = "<strong>" + label + "</strong> " + text;
		}
		const placeImg = document.querySelector(".place-photo img");
		if (placeImg && data.lugarReunion?.foto) {
			placeImg.src = data.lugarReunion.foto.src || "";
			placeImg.alt = data.lugarReunion.foto.alt || "";
			if (data.lugarReunion.foto.ancho) placeImg.width = data.lugarReunion.foto.ancho;
			if (data.lugarReunion.foto.alto) placeImg.height = data.lugarReunion.foto.alto;
		}
		setText(document.querySelector(".lunch-label"), data.lugarReunion?.etiquetaAlmuerzo || "");
		setText(document.querySelector(".notice-warm"), data.lugarReunion?.aviso || "");
	}

	function renderGatos(data) {
		document.title = data.tituloDocumento || document.title;
		setText(document.querySelector("#wrapper > header .inner h2"), data.encabezadoPagina?.titulo || "");
		setText(document.querySelector("#wrapper > header .inner p"), data.encabezadoPagina?.subtitulo || "");

		const grid = document.querySelector(".cats-grid");
		if (grid && Array.isArray(data.gatos)) {
			grid.innerHTML = data.gatos
				.map(function (cat) {
					const photo = cat.foto || {};
					const width = photo.ancho ? ' width="' + photo.ancho + '"' : "";
					const height = photo.alto ? ' height="' + photo.alto + '"' : "";
					return (
						'<article class="cat-card">' +
						'<div class="cat-photo"><img src="' +
						(photo.src || "") +
						'" alt="' +
						(photo.alt || "") +
						'"' +
						width +
						height +
						" /></div>" +
						'<p class="cat-name">' +
						(cat.nombre || "") +
						"</p>" +
						"</article>"
					);
				})
				.join("");
		}
	}

	function renderGeneric(data) {
		document.title = data.tituloDocumento || document.title;
		setText(document.querySelector("#wrapper > header .inner h2"), data.encabezadoPagina?.titulo || "");
		setText(document.querySelector("#wrapper > header .inner p"), data.encabezadoPagina?.subtitulo || "");

		const inner = document.querySelector("#wrapper > .wrapper > .inner");
		if (!inner) return;

		let html = "";
		(data.secciones || []).forEach(function (section) {
			html += '<h3 class="major">' + section.titulo + "</h3>";
			(section.parrafos || []).forEach(function (p) {
				html += "<p>" + p + "</p>";
			});
		});

		html += '<section class="features">';
		(data.caracteristicas || []).forEach(function (feature) {
			html +=
				"<article>" +
				'<a href="' + feature.enlaceImagen + '" class="image"><img src="' + feature.imagen + '" alt="' + (feature.altImagen || "") + '" /></a>' +
				'<h3 class="major">' + feature.titulo + "</h3>" +
				"<p>" + feature.descripcion + "</p>" +
				'<a href="' + feature.hrefBoton + '" class="special">' + feature.textoBoton + "</a>" +
				"</article>";
		});
		html += "</section>";
		inner.innerHTML = html;
	}

	function listMarkup(items, tag, className) {
		return (
			"<" +
			tag +
			(className ? ' class="' + className + '"' : "") +
			">" +
			(items || [])
				.map(function (item) {
					return "<li>" + item + "</li>";
				})
				.join("") +
			"</" +
			tag +
			">"
		);
	}

	function renderElements(data) {
		document.title = data.tituloDocumento || document.title;
		setText(document.querySelector("#wrapper > header .inner h2"), data.encabezadoPagina?.titulo || "");
		setText(document.querySelector("#wrapper > header .inner p"), data.encabezadoPagina?.subtitulo || "");

		const inner = document.querySelector("#wrapper > .wrapper > .inner");
		if (!inner) return;

		const tableRows = (data.tabla?.filas || [])
			.map(function (row) {
				return "<tr><td>" + row[0] + "</td><td>" + row[1] + "</td><td>" + row[2] + "</td></tr>";
			})
			.join("");

		const imageGrid = (data.imagenes?.ajustarCuadricula || [])
			.map(function (img) {
				return '<div class="col-' + (img.columnas || 4) + '"><span class="image fit"><img src="' + img.src + '" alt="' + (img.alt || "") + '" /></span></div>';
			})
			.join("");

		inner.innerHTML =
			"<section>" +
			'<h3 class="major">' + data.texto?.tituloSeccion + "</h3>" +
			(data.texto?.parrafoInlineHtml || "") +
			"<h4>" + (data.texto?.subtituloBlockquote || "") + "</h4>" +
			"<blockquote>" + (data.texto?.blockquote || "") + "</blockquote>" +
			"<h4>" + (data.texto?.subtituloPre || "") + "</h4>" +
			"<pre><code>" + (data.texto?.preCodigo || "") + "</code></pre>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' + data.listas?.tituloSeccion + "</h3>" +
			'<div class="row"><div class="col-6 col-12-medium"><h4>Unordered</h4>' +
			listMarkup(data.listas?.sinOrden, "ul", "") +
			"<h4>Alternate</h4>" +
			listMarkup(data.listas?.sinOrdenAlternativa, "ul", "alt") +
			'</div><div class="col-6 col-12-medium"><h4>Ordered</h4>' +
			listMarkup(data.listas?.ordenadas, "ol", "") +
			"<h4>Icons</h4><ul class=\"icons\">" +
			(data.listas?.iconosRedes || [])
				.map(function (icon) {
					return '<li><a href="' + icon.href + '" class="icon brands fa-' + icon.marca + '"><span class="label">' + icon.etiqueta + "</span></a></li>";
				})
				.join("") +
			"</ul></div></div>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' + data.tabla?.tituloSeccion + "</h3>" +
			'<h4>Default</h4><div class="table-wrapper"><table><thead><tr>' +
			(data.tabla?.columnas || []).map(function (c) { return "<th>" + c + "</th>"; }).join("") +
			"</tr></thead><tbody>" + tableRows + "</tbody><tfoot><tr><td colspan=\"2\"></td><td>" + (data.tabla?.totalPie || "") + "</td></tr></tfoot></table></div>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' + data.botones?.tituloSeccion + "</h3>" +
			'<ul class="actions"><li><a href="#" class="button primary">' + (data.botones?.etiquetas?.[0] || "Primary") + '</a></li><li><a href="#" class="button">' + (data.botones?.etiquetas?.[1] || "Default") + "</a></li></ul>" +
			"</section>" +
			"<section>" +
			'<h3 class="major">' + data.formulario?.tituloSeccion + "</h3>" +
			'<form method="' + (data.formulario?.metodo || "post") + '" action="' + (data.formulario?.accion || "#") + '">' +
			'<div class="row gtr-uniform"><div class="col-12"><label for="demo-name">' + (data.formulario?.campos?.[0]?.etiqueta || "Name") + '</label><input type="text" name="demo-name" id="demo-name" value="" /></div>' +
			'<div class="col-12"><ul class="actions"><li><input type="submit" value="' + (data.formulario?.enviar || "Send Message") + '" class="primary" /></li><li><input type="reset" value="' + (data.formulario?.restablecer || "Reset") + '" /></li></ul></div></div></form>' +
			"</section>" +
			"<section>" +
			'<h3 class="major">' + data.imagenes?.tituloSeccion + "</h3>" +
			"<h4>" + (data.imagenes?.ajustarTitulo || "") + '</h4><div class="box alt"><div class="row gtr-uniform">' + imageGrid + "</div></div>" +
			"<h4>" + (data.imagenes?.izquierdaDerechaTitulo || "") + "</h4>" +
			'<p><span class="image left"><img src="' + (data.imagenes?.parrafoImagenIzquierda?.src || "") + '" alt="' + (data.imagenes?.parrafoImagenIzquierda?.alt || "") + '" /></span>' + (data.imagenes?.parrafoImagenIzquierda?.texto || "") + "</p>" +
			'<p><span class="image right"><img src="' + (data.imagenes?.parrafoImagenDerecha?.src || "") + '" alt="' + (data.imagenes?.parrafoImagenDerecha?.alt || "") + '" /></span>' + (data.imagenes?.parrafoImagenDerecha?.texto || "") + "</p>" +
			"</section>";
	}

	function getPageName() {
		const file = window.location.pathname.split("/").pop() || "index.html";
		return file.replace(".html", "");
	}

	async function boot() {
		const pageName = getPageName();
		const [globalResp, pageResp] = await Promise.all([
			fetch("data/site-global.json"),
			fetch("data/" + pageName + ".json")
		]);
		if (!globalResp.ok || !pageResp.ok) return;
		const [globalData, pageData] = await Promise.all([globalResp.json(), pageResp.json()]);

		renderGlobal(globalData, pageData, pageName);
		if (pageName === "index") renderIndex(pageData);
		if (pageName === "faq") renderFaq(pageData);
		if (pageName === "current_book") renderCurrentBook(pageData);
		if (pageName === "donde-cuando") renderDondeCuando(pageData);
		if (pageName === "gatos") renderGatos(pageData);
		if (pageName === "generic") renderGeneric(pageData);
		if (pageName === "elements") renderElements(pageData);
	}

	document.addEventListener("DOMContentLoaded", function () {
		boot().catch(function (error) {
			console.error("content-loader error:", error);
		});
	});
})();
