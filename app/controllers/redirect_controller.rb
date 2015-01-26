class RedirectController < ApplicationController
  def to
    url = params[:url]
    if url.match(%r{^https?://twitter.com})
      redirect_to url
    else
      render text: 'error'
    end
  end
end
